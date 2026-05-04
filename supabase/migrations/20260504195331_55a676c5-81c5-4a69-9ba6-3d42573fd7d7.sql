
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'voter');
CREATE TYPE public.election_status AS ENUM ('draft', 'open', 'closed');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "roles_self_select" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "roles_admin_manage" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile + bootstrap first admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INT;
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'voter');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Elections
CREATE TABLE public.elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status election_status NOT NULL DEFAULT 'draft',
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  show_live_results BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "elections_public_read" ON public.elections FOR SELECT USING (true);
CREATE POLICY "elections_admin_all" ON public.elections FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Positions
CREATE TABLE public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "positions_public_read" ON public.positions FOR SELECT USING (true);
CREATE POLICY "positions_admin_all" ON public.positions FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Candidates
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo_url TEXT,
  bio TEXT,
  manifesto TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "candidates_public_read" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "candidates_admin_all" ON public.candidates FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Voter list (approved emails + voting code)
CREATE TABLE public.voter_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  voting_code TEXT NOT NULL,
  code_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(election_id, email)
);
ALTER TABLE public.voter_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "voter_list_admin_all" ON public.voter_list FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "voter_list_self_read" ON public.voter_list FOR SELECT USING (
  auth.uid() IS NOT NULL AND lower(email) = lower((SELECT email FROM public.profiles WHERE id = auth.uid()))
);

-- Votes
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(voter_id, position_id)
);
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes_public_read" ON public.votes FOR SELECT USING (true);
CREATE POLICY "votes_self_insert" ON public.votes FOR INSERT WITH CHECK (
  auth.uid() = voter_id
  AND EXISTS (SELECT 1 FROM public.elections e WHERE e.id = election_id AND e.status = 'open')
  AND EXISTS (
    SELECT 1 FROM public.voter_list v
    JOIN public.profiles p ON lower(p.email) = lower(v.email)
    WHERE v.election_id = election_id AND p.id = auth.uid() AND v.code_used = true
  )
);
CREATE POLICY "votes_admin_all" ON public.votes FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Code redemption RPC
CREATE OR REPLACE FUNCTION public.redeem_voting_code(_election_id UUID, _code TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email TEXT;
  v_row public.voter_list;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT email INTO v_email FROM public.profiles WHERE id = auth.uid();
  IF v_email IS NULL THEN RAISE EXCEPTION 'Profile not found'; END IF;

  SELECT * INTO v_row FROM public.voter_list
   WHERE election_id = _election_id AND lower(email) = lower(v_email) AND voting_code = _code;
  IF v_row IS NULL THEN RAISE EXCEPTION 'Invalid voting code'; END IF;
  IF v_row.code_used THEN RETURN true; END IF;

  UPDATE public.voter_list SET code_used = true, used_at = now(), user_id = auth.uid()
   WHERE id = v_row.id;
  RETURN true;
END;
$$;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
