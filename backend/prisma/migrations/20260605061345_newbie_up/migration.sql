/*
  Warnings:

  - You are about to drop the column `date` on the `Buffing` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Packed` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Production` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Quantity` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Repair` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Trimmer` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `labour_expense` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `labour_expense` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `misc_expense` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `misc_expense` table. All the data in the column will be lost.
  - Added the required column `entryDate` to the `Buffing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalValue` to the `Buffing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthBelongs` to the `Buffing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entryDate` to the `Packed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthBelongs` to the `Packed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entryDate` to the `Production` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthBelongs` to the `Production` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entryDate` to the `Quantity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthBelongs` to the `Quantity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entryDate` to the `Repair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthBelongs` to the `Repair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entryDate` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entryDate` to the `Trimmer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalValue` to the `Trimmer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthBelongs` to the `Trimmer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `labour_expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entryDate` to the `labour_expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthBelongs` to the `labour_expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `misc_expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entryDate` to the `misc_expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthBelongs` to the `misc_expense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Buffing" DROP COLUMN "date",
ADD COLUMN     "entryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "finalValue" INTEGER NOT NULL,
ADD COLUMN     "forRange" TEXT,
ADD COLUMN     "lastMonthRemaining" INTEGER,
ADD COLUMN     "monthBelongs" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Packed" DROP COLUMN "date",
ADD COLUMN     "entryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "monthBelongs" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Production" DROP COLUMN "date",
ADD COLUMN     "entryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "monthBelongs" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Quantity" DROP COLUMN "date",
ADD COLUMN     "entryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "monthBelongs" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Repair" DROP COLUMN "date",
ADD COLUMN     "entryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "monthBelongs" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "date",
ADD COLUMN     "entryDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Trimmer" DROP COLUMN "date",
ADD COLUMN     "entryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "finalValue" INTEGER NOT NULL,
ADD COLUMN     "forRange" TEXT,
ADD COLUMN     "lastMonthRemaining" INTEGER,
ADD COLUMN     "monthBelongs" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "labour_expense" DROP COLUMN "date",
DROP COLUMN "value",
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "entryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "monthBelongs" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "misc_expense" DROP COLUMN "date",
DROP COLUMN "value",
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "entryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "monthBelongs" TEXT NOT NULL;
