/*
  Warnings:

  - Made the column `webhookUrl` on table `Monitor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `balance` on table `Wallet` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Wallet_address_key";

-- AlterTable
ALTER TABLE "Monitor" ALTER COLUMN "webhookUrl" SET NOT NULL,
ALTER COLUMN "monitorIncoming" SET DEFAULT true,
ALTER COLUMN "monitorOutgoing" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Wallet" ALTER COLUMN "isTestnet" SET DEFAULT false,
ALTER COLUMN "balance" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Monitor_walletId_idx" ON "Monitor"("walletId");

-- CreateIndex
CREATE INDEX "Monitor_address_idx" ON "Monitor"("address");

-- CreateIndex
CREATE INDEX "Monitor_network_idx" ON "Monitor"("network");

-- CreateIndex
CREATE INDEX "Monitor_isActive_idx" ON "Monitor"("isActive");

-- CreateIndex
CREATE INDEX "Transaction_walletId_idx" ON "Transaction"("walletId");

-- CreateIndex
CREATE INDEX "Transaction_address_idx" ON "Transaction"("address");

-- CreateIndex
CREATE INDEX "Transaction_timestamp_idx" ON "Transaction"("timestamp");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Wallet_address_idx" ON "Wallet"("address");

-- CreateIndex
CREATE INDEX "Wallet_network_symbol_idx" ON "Wallet"("network", "symbol");

-- CreateIndex
CREATE INDEX "Wallet_createdAt_idx" ON "Wallet"("createdAt");
