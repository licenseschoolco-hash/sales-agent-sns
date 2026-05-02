-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "target_industry" TEXT NOT NULL,
    "price_range" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "product_pain_points" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "pain_point" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 3,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "product_pain_points_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_value_props" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "proposition" TEXT NOT NULL,
    "evidence" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "product_value_props_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "target_companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "website" TEXT,
    "employee_count" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "target_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "role" TEXT,
    "profile_url" TEXT NOT NULL,
    "followers_count" INTEGER,
    "bio" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "target_accounts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "target_companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "target_analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "analysis_type" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "analyzed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "target_analysis_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "target_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "target_analysis_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lead_scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "total_score" INTEGER NOT NULL,
    "profile_score" INTEGER NOT NULL DEFAULT 0,
    "engagement_score" INTEGER NOT NULL DEFAULT 0,
    "need_score" INTEGER NOT NULL DEFAULT 0,
    "timing_score" INTEGER NOT NULL DEFAULT 0,
    "score_reason" TEXT NOT NULL,
    "scored_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lead_scores_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "target_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "lead_scores_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dm_drafts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "tone" TEXT NOT NULL DEFAULT 'friendly',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "generated_by" TEXT NOT NULL DEFAULT 'manual',
    "approved_by" TEXT,
    "approved_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dm_drafts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "target_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dm_drafts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "outreach_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dm_draft_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "sent_at" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "outreach_logs_dm_draft_id_fkey" FOREIGN KEY ("dm_draft_id") REFERENCES "dm_drafts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "outreach_logs_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "target_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "outreach_logs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "replies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "outreach_log_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "reply_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentiment" TEXT,
    "next_action" TEXT,
    "replied_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "replies_outreach_log_id_fkey" FOREIGN KEY ("outreach_log_id") REFERENCES "outreach_logs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "replies_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "target_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "scheduled_at" DATETIME NOT NULL,
    "duration_min" INTEGER NOT NULL DEFAULT 30,
    "meeting_type" TEXT NOT NULL DEFAULT 'online',
    "meeting_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "outcome" TEXT,
    "lost_reason" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "appointments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "target_companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "appointments_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
