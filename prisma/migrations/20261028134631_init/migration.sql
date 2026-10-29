-- CreateTable
CREATE TABLE "tools" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "seoTitle" TEXT,
    "metaDesc" TEXT,
    "schemaJson" JSONB,
    "config" JSONB,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_inputs" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fieldType" TEXT NOT NULL,
    "validation" JSONB,
    "options" JSONB,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tool_inputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_datasets" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "datasetKey" TEXT NOT NULL,
    "region" TEXT,
    "payload" JSONB NOT NULL,
    "effectiveDate" TIMESTAMP(3),

    CONSTRAINT "tool_datasets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculation_rules" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "ruleKey" TEXT NOT NULL,
    "expression" TEXT NOT NULL,
    "conditions" JSONB,
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "calculation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_content" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "blockType" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "content" JSONB NOT NULL,
    "orderIdx" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tool_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_events" (
    "id" BIGSERIAL NOT NULL,
    "toolId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tool_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tools_slug_key" ON "tools"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tool_inputs_toolId_fieldKey_key" ON "tool_inputs"("toolId", "fieldKey");

-- CreateIndex
CREATE INDEX "tool_datasets_toolId_datasetKey_region_idx" ON "tool_datasets"("toolId", "datasetKey", "region");

-- CreateIndex
CREATE INDEX "tool_events_toolId_eventType_idx" ON "tool_events"("toolId", "eventType");

-- AddForeignKey
ALTER TABLE "tool_inputs" ADD CONSTRAINT "tool_inputs_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_datasets" ADD CONSTRAINT "tool_datasets_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculation_rules" ADD CONSTRAINT "calculation_rules_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_content" ADD CONSTRAINT "tool_content_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_events" ADD CONSTRAINT "tool_events_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
