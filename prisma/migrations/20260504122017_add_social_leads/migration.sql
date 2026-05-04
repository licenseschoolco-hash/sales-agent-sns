-- CreateTable
CREATE TABLE "social_lead_candidates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sns_type" TEXT NOT NULL,
    "handle" TEXT,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "profile_text" TEXT,
    "follower_count" INTEGER,
    "lead_score" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "diagnosis_type" TEXT,
    "target_company_id" TEXT,
    "product_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "social_lead_candidates_target_company_id_fkey" FOREIGN KEY ("target_company_id") REFERENCES "target_companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "social_lead_candidates_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "social_touch_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "social_lead_candidate_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "owned_account_name" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "social_touch_logs_social_lead_candidate_id_fkey" FOREIGN KEY ("social_lead_candidate_id") REFERENCES "social_lead_candidates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "social_lead_candidates_url_key" ON "social_lead_candidates"("url");
