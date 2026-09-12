-- CreateIndex
CREATE INDEX "items_isActive_idx" ON "items"("isActive");

-- CreateIndex
CREATE INDEX "inventory_userId_isEquipped_idx" ON "inventory"("userId", "isEquipped");
