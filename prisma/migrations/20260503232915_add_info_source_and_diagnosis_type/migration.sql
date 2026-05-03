-- CreateTable
CREATE TABLE "information_sources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "target_company_id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "content" TEXT,
    "verification_status" TEXT NOT NULL DEFAULT 'pending',
    "last_verified_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "information_sources_target_company_id_fkey" FOREIGN KEY ("target_company_id") REFERENCES "target_companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_recruitment_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "target_company_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "score_job_clarity" INTEGER NOT NULL DEFAULT 5,
    "score_atmosphere" INTEGER NOT NULL DEFAULT 5,
    "score_daily_routine" INTEGER NOT NULL DEFAULT 5,
    "score_beginner_safety" INTEGER NOT NULL DEFAULT 5,
    "score_application_flow" INTEGER NOT NULL DEFAULT 5,
    "score_appeal_power" INTEGER NOT NULL DEFAULT 5,
    "total_score" INTEGER NOT NULL DEFAULT 0,
    "general_review" TEXT,
    "improvement_points" TEXT,
    "proposal_message" TEXT,
    "sending_message" TEXT,
    "source_type" TEXT NOT NULL DEFAULT 'manual',
    "diagnosis_url" TEXT,
    "source_text" TEXT,
    "ai_analysis_log" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "diagnosis_type" TEXT NOT NULL DEFAULT 'recruitment_video',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "recruitment_reports_target_company_id_fkey" FOREIGN KEY ("target_company_id") REFERENCES "target_companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recruitment_reports_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_recruitment_reports" ("ai_analysis_log", "created_at", "diagnosis_url", "general_review", "id", "improvement_points", "product_id", "proposal_message", "score_appeal_power", "score_application_flow", "score_atmosphere", "score_beginner_safety", "score_daily_routine", "score_job_clarity", "sending_message", "source_text", "source_type", "status", "target_company_id", "total_score", "updated_at") SELECT "ai_analysis_log", "created_at", "diagnosis_url", "general_review", "id", "improvement_points", "product_id", "proposal_message", "score_appeal_power", "score_application_flow", "score_atmosphere", "score_beginner_safety", "score_daily_routine", "score_job_clarity", "sending_message", "source_text", "source_type", "status", "target_company_id", "total_score", "updated_at" FROM "recruitment_reports";
DROP TABLE "recruitment_reports";
ALTER TABLE "new_recruitment_reports" RENAME TO "recruitment_reports";
CREATE TABLE "new_target_companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "region" TEXT,
    "contact_name" TEXT,
    "sns_url" TEXT,
    "website" TEXT,
    "job_page_url" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "employee_count" TEXT,
    "address" TEXT,
    "source_status" TEXT NOT NULL DEFAULT 'sns_only',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_target_companies" ("address", "contact_name", "created_at", "email", "employee_count", "id", "industry", "job_page_url", "name", "notes", "phone", "region", "sns_url", "status", "website") SELECT "address", "contact_name", "created_at", "email", "employee_count", "id", "industry", "job_page_url", "name", "notes", "phone", "region", "sns_url", "status", "website" FROM "target_companies";
DROP TABLE "target_companies";
ALTER TABLE "new_target_companies" RENAME TO "target_companies";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "information_sources_target_company_id_idx" ON "information_sources"("target_company_id");
