CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'inquiry' NOT NULL,
	"link" text,
	"sender_logo_url" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "epc_projects" ALTER COLUMN "segment_type" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "epc_projects" ALTER COLUMN "segment_type" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "epc_installers" ADD COLUMN "certifications" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_read_idx" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "inquiries_receiver_read_idx" ON "inquiries" USING btree ("receiver_id","is_read");--> statement-breakpoint
CREATE INDEX "live_qa_questions_session_answered_idx" ON "live_qa_questions" USING btree ("session_id","is_answered");--> statement-breakpoint
ALTER TABLE "brands" DROP COLUMN "qr_url";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "qr_code";