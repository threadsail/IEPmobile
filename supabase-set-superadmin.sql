-- Set a user as Superadmin (can update suggestion status and other superadmin-only features).
-- Run in Supabase SQL Editor. Replace YOUR_USER_ID with the auth.users id (UUID) of the account.

-- Option 1: Set by user email (run after the user has signed up at least once)
-- update public.profiles
-- set role = 'Superadmin'
-- where id = (select id from auth.users where email = 'admin@example.com' limit 1);

-- Option 2: Set by user UUID (get the id from Supabase Auth dashboard or auth.users)
update public.profiles
set role = 'Superadmin'
where id = 'YOUR_USER_ID';
