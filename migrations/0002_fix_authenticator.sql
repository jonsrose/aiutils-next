DO $$ 
DECLARE
    constraint_name text;
BEGIN
    -- Find existing primary key name
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints tc
    WHERE tc.table_name = 'authenticator'
    AND tc.constraint_type = 'PRIMARY KEY';

    -- Drop if exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE "authenticator" DROP CONSTRAINT "' || constraint_name || '"';
    END IF;
END $$;

ALTER TABLE "authenticator" ADD CONSTRAINT authenticator_userid_credentialid_pk PRIMARY KEY("userId", "credentialID");
