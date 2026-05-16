
ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS votes_voter_id_fkey;

DO $$
DECLARE
  v_election uuid := gen_random_uuid();
  v_position uuid := gen_random_uuid();
  v_c1 uuid := gen_random_uuid();
  v_c2 uuid := gen_random_uuid();
  v_c3 uuid := gen_random_uuid();
  i int;
  block text;
  flat int;
  block_letters text[] := ARRAY['A','B','C','D'];
BEGIN
  INSERT INTO public.elections (id, title, description, status, start_at, end_at, show_live_results)
  VALUES (
    v_election,
    'Society Development Fund Allocation 2026',
    'GreenView Cooperative Housing Society — residents vote on how the annual society development fund should be allocated for security, infrastructure, and community welfare improvements.',
    'open',
    now() - interval '3 days',
    now() + interval '2 days',
    true
  );

  INSERT INTO public.positions (id, election_id, title, description, display_order)
  VALUES (
    v_position,
    v_election,
    'Society Development Representative',
    'Choose the representative who will lead the 2026 fund allocation across security, welfare, and infrastructure.',
    0
  );

  INSERT INTO public.candidates (id, position_id, name, bio, manifesto, photo_url) VALUES
  (v_c1, v_position, 'Sandesh Kamble',
   'Resident of Flat A-101. Software engineer passionate about smart-society technology and resident safety.',
   E'Focus on modern security systems, CCTV upgrades, and smart parking management.\n\nKey promises:\n• Smart gate entry system\n• New CCTV installation across all blocks\n• Visitor tracking mobile app\n• Better parking allocation for residents',
   'https://api.dicebear.com/7.x/initials/svg?seed=Sandesh%20Kamble&backgroundColor=1e40af&textColor=ffffff'),
  (v_c2, v_position, 'Prashant Kamble',
   'Resident of Flat B-204. Community organizer with 8 years of experience in resident welfare programs.',
   E'Improve community facilities, garden maintenance, and resident activities.\n\nKey promises:\n• Children''s play area upgrades\n• Society festival funding\n• Garden redevelopment\n• Community hall improvements',
   'https://api.dicebear.com/7.x/initials/svg?seed=Prashant%20Kamble&backgroundColor=047857&textColor=ffffff'),
  (v_c3, v_position, 'Sanjay Kamble',
   'Resident of Flat C-302. Civil engineer focused on long-term infrastructure resilience and sustainability.',
   E'Prioritize water management, lift maintenance, and structural improvements.\n\nKey promises:\n• Water tank modernization\n• Lift servicing improvements\n• Solar energy initiative\n• Better drainage systems',
   'https://api.dicebear.com/7.x/initials/svg?seed=Sanjay%20Kamble&backgroundColor=7c2d12&textColor=ffffff');

  FOR i IN 1..390 LOOP
    block := block_letters[((i - 1) % 4) + 1];
    flat := 100 + ((i - 1) / 4) + 1;
    INSERT INTO public.voter_list (election_id, email, voting_code, code_used, used_at, user_id)
    VALUES (
      v_election,
      'resident' || i || '.flat' || block || '-' || flat || '@greenview.demo',
      upper(substr(md5(random()::text), 1, 4)) || '-' || upper(substr(md5(random()::text), 1, 4)),
      i <= 312,
      CASE WHEN i <= 312 THEN now() - (random() * interval '2 days') ELSE NULL END,
      NULL
    );
  END LOOP;

  FOR i IN 1..78 LOOP
    INSERT INTO public.votes (election_id, position_id, candidate_id, voter_id, created_at)
    VALUES (v_election, v_position, v_c1, gen_random_uuid(), now() - (random() * interval '2 days'));
  END LOOP;
  FOR i IN 1..78 LOOP
    INSERT INTO public.votes (election_id, position_id, candidate_id, voter_id, created_at)
    VALUES (v_election, v_position, v_c2, gen_random_uuid(), now() - (random() * interval '2 days'));
  END LOOP;
  FOR i IN 1..156 LOOP
    INSERT INTO public.votes (election_id, position_id, candidate_id, voter_id, created_at)
    VALUES (v_election, v_position, v_c3, gen_random_uuid(), now() - (random() * interval '2 days'));
  END LOOP;
END $$;
