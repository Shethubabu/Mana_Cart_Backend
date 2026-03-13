ALTER TABLE "Order"
ADD COLUMN "addressId" INTEGER,
ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN "paymentIntentId" TEXT,
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'inr';

CREATE UNIQUE INDEX "Order_paymentIntentId_key" ON "Order"("paymentIntentId");

ALTER TABLE "Order"
ADD CONSTRAINT "Order_addressId_fkey"
FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
