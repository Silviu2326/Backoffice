-- Add expo_push_token column to user_profiles table if it doesn't exist

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'expo_push_token') THEN
        ALTER TABLE public.user_profiles ADD COLUMN expo_push_token TEXT;
    END IF;
END $$;
