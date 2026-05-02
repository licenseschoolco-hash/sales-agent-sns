-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_target_companies" ("address", "created_at", "employee_count", "id", "industry", "name", "notes", "website") SELECT "address", "created_at", "employee_count", "id", "industry", "name", "notes", "website" FROM "target_companies";
DROP TABLE "target_companies";
ALTER TABLE "new_target_companies" RENAME TO "target_companies";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
