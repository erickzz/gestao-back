-- Partial unique index for system categories (userId IS NULL)
-- Prevents duplicate system categories with same name and type
CREATE UNIQUE INDEX "category_system_name_type_key" ON "category"("name", "type") WHERE "userId" IS NULL;