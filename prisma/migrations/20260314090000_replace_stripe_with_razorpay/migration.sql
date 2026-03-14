ALTER TABLE "Order"
RENAME COLUMN "paymentIntentId" TO "paymentProviderOrderId";

ALTER TABLE "Order"
ADD COLUMN "paymentProvider" TEXT NOT NULL DEFAULT 'razorpay',
ADD COLUMN "paymentProviderPaymentId" TEXT;

ALTER TABLE "Order"
ALTER COLUMN "currency" SET DEFAULT 'INR';

DROP INDEX "Order_paymentIntentId_key";

CREATE UNIQUE INDEX "Order_paymentProviderOrderId_key"
ON "Order"("paymentProviderOrderId");

CREATE UNIQUE INDEX "Order_paymentProviderPaymentId_key"
ON "Order"("paymentProviderPaymentId");
