
UPDATE auth.users
SET encrypted_password = crypt('castvotesandesh', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE lower(email) = 'sandeshsanjaykamble52@gmail.com';
