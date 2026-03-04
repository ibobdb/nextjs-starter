/*
  Warnings:

  - You are about to drop the column `name` on the `menu` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `menu` table. All the data in the column will be lost.
  - You are about to drop the `app_module` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[providerId,accountId]` on the table `account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `menu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "menu" DROP COLUMN "name",
DROP COLUMN "path",
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parentId" INTEGER,
ADD COLUMN     "permissionId" INTEGER,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "url" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "banned" BOOLEAN,
ADD COLUMN     "role" TEXT;

-- DropTable
DROP TABLE "app_module";

-- CreateTable
CREATE TABLE "team_permission" (
    "id" SERIAL NOT NULL,
    "teamId" TEXT NOT NULL,
    "permissionId" INTEGER NOT NULL,

    CONSTRAINT "team_permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_permission_teamId_permissionId_key" ON "team_permission"("teamId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");

-- AddForeignKey
ALTER TABLE "team_permission" ADD CONSTRAINT "team_permission_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_permission" ADD CONSTRAINT "team_permission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu" ADD CONSTRAINT "menu_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu" ADD CONSTRAINT "menu_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
