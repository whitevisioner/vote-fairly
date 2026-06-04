
-- 1. Update trigger: only new admin email is auto-admin
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

  is_seed_admin := lower(NEW.email) = 'sandeshsanjaykamble52@gmail.com';

  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  IF user_count = 0 OR is_seed_admin THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'voter');
  END IF;
  RETURN NEW;
END;
$function$;

-- 2. Demote old admin & demo accounts to voter
DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id IN (
    SELECT id FROM auth.users
    WHERE lower(email) IN ('admin@castvote.com', 'demo-admin@castvote.app')
  );

-- 3. Create new admin user
DO $$
DECLARE
  new_admin_id uuid;
  old_demo_id uuid;
  new_demo_id uuid;
BEGIN
  -- New admin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = 'sandeshsanjaykamble52@gmail.com') THEN
    new_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_admin_id, 'authenticated', 'authenticated',
      'sandeshsanjaykamble52@gmail.com', crypt('castvotesandesh', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Sandesh Sanjay Kamble"}'::jsonb,
      now(), now(), '', '', '', ''
    );
  END IF;

  -- New demo voter
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = 'demo@castvote.in') THEN
    new_demo_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_demo_id, 'authenticated', 'authenticated',
      'demo@castvote.in', crypt('demo123', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Demo Voter"}'::jsonb,
      now(), now(), '', '', '', ''
    );
  END IF;

  -- Re-point existing demo elections to new demo user
  SELECT id INTO new_demo_id FROM auth.users WHERE lower(email) = 'demo@castvote.in' LIMIT 1;
  old_demo_id := '7ebcdf88-10aa-4929-9fa6-00cc95c9213d'::uuid;
  IF new_demo_id IS NOT NULL THEN
    UPDATE public.elections SET created_by = new_demo_id WHERE created_by = old_demo_id;
  END IF;
END $$;
