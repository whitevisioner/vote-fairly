
DELETE FROM public.voter_list WHERE lower(email) = 'demo@castvote.com';

INSERT INTO public.voter_list (election_id, email, voting_code, code_used)
SELECT id, 'demo@castvote.com', 'DEMO-2026', false
FROM public.elections
WHERE title = 'Society Development Fund Allocation 2026'
LIMIT 1;
