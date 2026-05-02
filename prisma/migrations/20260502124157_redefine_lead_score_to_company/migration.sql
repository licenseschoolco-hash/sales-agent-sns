/*
  Warnings:

  - You are about to drop the column `account_id` on the `lead_scores` table. All the data in the column will be lost.
  - You are about to drop the column `engagement_score` on the `lead_scores` table. All the data in the column will be lost.
  - You are about to drop the column `need_score` on the `lead_scores` table. All the data in the column will be lost.
  - You are about to drop the column `profile_score` on the `lead_scores` table. All the data in the column will be lost.
  - You are about to drop the column `score_reason` on the `lead_scores` table. All the data in the column will be lost.
  - You are about to drop the column `scored_at` on the `lead_scores` table. All the data in the column will be lost.
  - You are about to drop the column `timing_score` on the `lead_scores` table. All the data in the column will be lost.
  - Added the required column `target_company_id` to the `lead_scores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `lead_scores` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_lead_scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "target_company_id" TEXT NOT NULL,
    "is_hiring" BOOLEAN NOT NULL DEFAULT false,
    "has_hiring_page" BOOLEAN NOT NULL DEFAULT false,
    "video_usage" TEXT NOT NULL DEFAULT 'none',
    "post_frequency" TEXT NOT NULL DEFAULT 'none',
    "engagement" TEXT NOT NULL DEFAULT 'low',
    "has_phone" BOOLEAN NOT NULL DEFAULT false,
    "has_contact_form" BOOLEAN NOT NULL DEFAULT false,
    "product_fit" INTEGER NOT NULL DEFAULT 3,
    "hypothesis_fit" INTEGER NOT NULL DEFAULT 3,
    "total_score" INTEGER NOT NULL DEFAULT 0,
    "priority" TEXT NOT NULL DEFAULT 'C',
    "reason" TEXT,
    "next_action" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "lead_scores_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "lead_scores_target_company_id_fkey" FOREIGN KEY ("target_company_id") REFERENCES "target_companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_lead_scores" ("id", "product_id", "total_score") SELECT "id", "product_id", "total_score" FROM "lead_scores";
DROP TABLE "lead_scores";
ALTER TABLE "new_lead_scores" RENAME TO "lead_scores";
CREATE UNIQUE INDEX "lead_scores_product_id_target_company_id_key" ON "lead_scores"("product_id", "target_company_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
