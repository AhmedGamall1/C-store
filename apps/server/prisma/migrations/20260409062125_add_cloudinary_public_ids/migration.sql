/*
  Warnings:

  - Added the required column `imagePublicId` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imagePublicId` to the `products` table without a default value. This is not possible if the table is not empty.
  - Made the column `imageUrl` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "imagePublicId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "imagePublicId" TEXT NOT NULL,
ADD COLUMN     "imagePublicIds" TEXT[],
ALTER COLUMN "imageUrl" SET NOT NULL;
