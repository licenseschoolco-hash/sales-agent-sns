/*
  Warnings:

  - You are about to drop the column `account_id` on the `dm_drafts` table. All the data in the column will be lost.
  - You are about to drop the column `approved_at` on the `dm_drafts` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by` on the `dm_drafts` table. All the data in the column will be lost.
  - You are about to drop the column `generated_by` on the `dm_drafts` table. All the data in the column will be lost.
  - You are about to drop the column `tone` on the `dm_drafts` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `dm_drafts` table. All the data in the column will be lost.
  - Added the required column `target_company_id` to the `dm_drafts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `dm_drafts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `dm_drafts` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_dm_drafts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "target_company_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "lead_score_id" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "dm_drafts_target_company_id_fkey" FOREIGN KEY ("target_company_id") REFERENCES "target_companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dm_drafts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dm_drafts_lead_score_id_fkey" FOREIGN KEY ("lead_score_id") REFERENCES "lead_scores" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_dm_drafts" ("body", "created_at", "id", "product_id", "status", "subject") SELECT "body", "created_at", "id", "product_id", "status", "subject" FROM "dm_drafts";
DROP TABLE "dm_drafts";
ALTER TABLE "new_dm_drafts" RENAME TO "dm_drafts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
