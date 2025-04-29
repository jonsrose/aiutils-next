DO $$ BEGIN
    -- Enable RLS for user_recipe (user data)
    ALTER TABLE user_recipe ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can only see their own recipes" ON user_recipe
        FOR ALL
        USING ("userId" = current_user);

    -- Enable RLS for session (user sessions)
    ALTER TABLE session ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can only access their own sessions" ON session
        FOR ALL
        USING ("userId" = current_user);

    -- Enable RLS for users (user profiles)
    ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can only see their own user data" ON "user"
        FOR ALL
        USING ("id" = current_user);

    -- Enable RLS for account (OAuth connections)
    ALTER TABLE account ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can only access their own accounts" ON account
        FOR ALL
        USING ("userId" = current_user);

    -- Note: verificationToken and authenticator tables intentionally excluded from RLS
    -- as they are part of the authentication system itself
END $$;
