
-- Audit log table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_admin_read" ON public.audit_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "audit_admin_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs (created_at DESC);
CREATE INDEX audit_logs_target_idx ON public.audit_logs (target_table, target_id);

-- Cascade-delete an election and all related rows
CREATE OR REPLACE FUNCTION public.delete_election_cascade(_election_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  DELETE FROM public.votes WHERE election_id = _election_id;
  DELETE FROM public.voter_list WHERE election_id = _election_id;
  DELETE FROM public.candidates
    WHERE position_id IN (SELECT id FROM public.positions WHERE election_id = _election_id);
  DELETE FROM public.positions WHERE election_id = _election_id;
  DELETE FROM public.elections WHERE id = _election_id;

  INSERT INTO public.audit_logs (actor_id, action, target_table, target_id, details)
  VALUES (auth.uid(), 'election.deleted', 'elections', _election_id, '{}'::jsonb);
END;
$$;
