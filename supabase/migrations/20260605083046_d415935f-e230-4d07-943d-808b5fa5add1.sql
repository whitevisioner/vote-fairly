
REVOKE EXECUTE ON FUNCTION public.delete_election_cascade(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_election_cascade(uuid) TO authenticated;
