ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "expires_at" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "expires_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_session_token_pk" PRIMARY KEY("session_token");