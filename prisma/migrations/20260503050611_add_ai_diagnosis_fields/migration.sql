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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "recruitment_reports_target_company_id_fkey" FOREIGN KEY ("target_company_id") REFERENCES "target_companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recruitment_reports_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_recruitment_reports" ("created_at", "general_review", "id", "improvement_points", "product_id", "proposal_message", "score_appeal_power", "score_application_flow", "score_atmosphere", "score_beginner_safety", "score_daily_routine", "score_job_clarity", "sending_message", "status", "target_company_id", "total_score", "updated_at") SELECT "created_at", "general_review", "id", "improvement_points", "product_id", "proposal_message", "score_appeal_power", "score_application_flow", "score_atmosphere", "score_beginner_safety", "score_daily_routine", "score_job_clarity", "sending_message", "status", "target_company_id", "total_score", "updated_at" FROM "recruitment_reports";
DROP TABLE "recruitment_reports";
ALTER TABLE "new_recruitment_reports" RENAME TO "recruitment_reports";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
