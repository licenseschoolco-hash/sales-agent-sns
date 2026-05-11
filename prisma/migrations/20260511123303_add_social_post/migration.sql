-- CreateTable
CREATE TABLE "social_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT,
    "category" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cta_label" TEXT,
    "cta_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduled_date" DATETIME,
    "posted_at" DATETIME,
    "engagement_note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "social_posts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
