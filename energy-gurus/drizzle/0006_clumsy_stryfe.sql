CREATE TABLE "writer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"picture_url" text,
	"designation" text,
	"bio" text,
	"social_links" jsonb DEFAULT '{}'::jsonb,
	"status" text DEFAULT 'draft' NOT NULL,
	"admin_feedback" text,
	"approval_history" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "writer_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "author_facebook" text;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "author_instagram" text;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "author_twitter" text;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "author_tiktok" text;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "author_bio" text;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "status" text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "admin_feedback" text;--> statement-breakpoint
ALTER TABLE "writer_profiles" ADD CONSTRAINT "writer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "writer_profiles_user_id_idx" ON "writer_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "writer_profiles_status_idx" ON "writer_profiles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "writer_profiles_created_at_idx" ON "writer_profiles" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "news_status_idx" ON "news" USING btree ("status");