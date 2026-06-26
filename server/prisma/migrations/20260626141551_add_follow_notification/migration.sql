-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'follow';

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_entry_id_fkey";

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "entry_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
