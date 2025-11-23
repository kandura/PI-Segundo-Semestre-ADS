/*
  Warnings:

  - You are about to alter the column `expiresIn` on the `SpotifyAuth` table. The data in that column could be lost. The data in that column will be cast from `Int` to `DateTime`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SpotifyAuth" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresIn" DATETIME NOT NULL,
    "tokenObtainedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_SpotifyAuth" ("accessToken", "createdAt", "expiresIn", "id", "refreshToken") SELECT "accessToken", "createdAt", "expiresIn", "id", "refreshToken" FROM "SpotifyAuth";
DROP TABLE "SpotifyAuth";
ALTER TABLE "new_SpotifyAuth" RENAME TO "SpotifyAuth";
CREATE UNIQUE INDEX "SpotifyAuth_refreshToken_key" ON "SpotifyAuth"("refreshToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
