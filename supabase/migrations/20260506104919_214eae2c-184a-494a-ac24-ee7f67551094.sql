
-- Update trigger to recognize new admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_count INT;
  is_seed_admin BOOLEAN;
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  is_seed_admin := lower(NEW.email) IN ('demo-admin@castvote.app', 'admin@castvote.com');

  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  IF user_count = 0 OR is_seed_admin THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'voter');
  END IF;
  RETURN NEW;
END;
$function$;

-- Seed Demo General Election (idempotent)
DO $$
DECLARE
  v_election_id UUID;
  v_position_id UUID;
BEGIN
  SELECT id INTO v_election_id FROM public.elections WHERE title = 'Demo General Election' LIMIT 1;
  IF v_election_id IS NULL THEN
    INSERT INTO public.elections (title, description, status, show_live_results, start_at, end_at)
    VALUES (
      'Demo General Election',
      'A live demo election to explore CastVote. Cast your test ballot for the next community representative.',
      'open',
      true,
      now(),
      now() + interval '30 days'
    )
    RETURNING id INTO v_election_id;

    INSERT INTO public.positions (election_id, title, description, display_order)
    VALUES (v_election_id, 'Community Representative', 'Choose one candidate to represent the community.', 1)
    RETURNING id INTO v_position_id;

    INSERT INTO public.candidates (position_id, name, bio, manifesto) VALUES
      (v_position_id, 'Aarav Mehta', 'Civic-tech advocate from Mumbai.', 'Transparent governance and inclusive growth for all members.'),
      (v_position_id, 'Priya Sharma', 'Community organizer and educator.', 'Stronger education access and digital literacy programs.');
  END IF;
END $$;
