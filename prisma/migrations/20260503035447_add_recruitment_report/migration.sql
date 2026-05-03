-- CreateTable
CREATE TABLE "recruitment_reports" (
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
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "recruitment_reports_target_company_id_fkey" FOREIGN KEY ("target_company_id") REFERENCES "target_companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recruitment_reports_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
