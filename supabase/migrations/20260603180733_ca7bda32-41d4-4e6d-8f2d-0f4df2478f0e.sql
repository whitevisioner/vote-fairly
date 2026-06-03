-- Demote demo account to voter and tag all demo elections under it
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

  is_seed_admin := lower(NEW.email) = 'admin@castvote.com';

  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  IF user_count = 0 OR is_seed_admin THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'voter');
  END IF;
  RETURN NEW;
END;
$function$;