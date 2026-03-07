CREATE TABLE "app_user" (
	"user_id" text PRIMARY KEY NOT NULL,
	"last_org_id" text
);
--> statement-breakpoint
ALTER TABLE "app_user" ADD CONSTRAINT "app_user_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_user" ADD CONSTRAINT "app_user_last_org_id_organization_id_fk" FOREIGN KEY ("last_org_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;