CREATE TABLE "monitoring_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"total_power_flow" text NOT NULL,
	"grid_export" text NOT NULL,
	"self_consumption" integer NOT NULL,
	"inverter_health" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"alerts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
