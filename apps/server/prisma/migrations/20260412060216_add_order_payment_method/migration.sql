-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'PAYMOB');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'COD',
ADD COLUMN     "reservedUntil" TIMESTAMP(3);
