/*
  Warnings:

  - You are about to drop the column `account_id` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `company_id` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `duration_min` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `meeting_type` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `meeting_url` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `account_id` on the `replies` table. All the data in the column will be lost.
  - You are about to drop the column `outreach_log_id` on the `replies` table. All the data in the column will be lost.
  - You are about to drop the column `sentiment` on the `replies` table. All the data in the column will be lost.
  - Added the required column `target_company_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target_company_id` to the `replies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `replies` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_appointments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "target_company_id" TEXT NOT NULL,
    "product_id" TEXT,
    "reply_id" TEXT,
    "scheduled_at" DATETIME,
    "outcome" TEXT NOT NULL DEFAULT 'pending',
    "lost_reason" TEXT,
    "amount" INTEGER,
    "next_follow_up_date" DATETIME,
    "memo" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "appointments_target_company_id_fkey" FOREIGN KEY ("target_company_id") REFERENCES "target_companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "appointments_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "appointments_reply_id_fkey" FOREIGN KEY ("reply_id") REFERENCES "replies" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_appointments" ("created_at", "id", "lost_reason", "outcome", "product_id", "scheduled_at", "updated_at") SELECT "created_at", "id", "lost_reason", coalesce("outcome", 'pending') AS "outcome", "product_id", "scheduled_at", "updated_at" FROM "appointments";
DROP TABLE "appointments";
ALTER TABLE "new_appointments" RENAME TO "appointments";
CREATE TABLE "new_replies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "target_company_id" TEXT NOT NULL,
    "product_id" TEXT,
    "dm_draft_id" TEXT,
    "reply_type" TEXT NOT NULL,
    "content" TEXT,
    "next_action" TEXT,
    "next_follow_up_date" DATETIME,
    "replied_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "replies_target_company_id_fkey" FOREIGN KEY ("target_company_id") REFERENCES "target_companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "replies_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "replies_dm_draft_id_fkey" FOREIGN KEY ("dm_draft_id") REFERENCES "dm_drafts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_replies" ("content", "created_at", "id", "next_action", "replied_at", "reply_type") SELECT "content", "created_at", "id", "next_action", "replied_at", "reply_type" FROM "replies";
DROP TABLE "replies";
ALTER TABLE "new_replies" RENAME TO "replies";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
