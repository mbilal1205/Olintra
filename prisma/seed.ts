/**
 * ================================================================
 * Olintra — Prisma Seed Script
 * ================================================================
 *
 * Purpose: Cron Generator tool ki saari configuration data seed karna.
 * Tables: tools, tool_inputs, tool_datasets, tool_content, calculation_rules
 *
 * Idempotency:
 *  - Tool: upsert on slug (safe to re-run)
 *  - Inputs: upsert on [toolId, fieldKey]
 *  - Datasets/Content/Rules: deleteMany by toolId → createMany (fresh refresh)
 *
 * Run: npx prisma db seed
 * ================================================================
 */

import { PrismaClient } from "@prisma/client";
// Seed script apna alag PrismaClient banata hai (dev hot-reload ke liye
// src/lib/db.ts singleton use karna theek nahi — tsx isse path-aliases
// resolve nahi kar sakta).
const db = new PrismaClient({
  datasourceUrl: process.env.DIRECT_URL,
});

// ================================================================
// SECTION 1: Tool Master Record
// ----------------------------------------------------------------
// Yeh row har tool ki "entry" hai. slug unique hai — isi par route
// /cron-generator ka page resolve hoga.
// status: "draft" rakha hai — Phase F mein deploy ke waqt "live" karenge.
// config: JSONB — future mein renderer version ya feature flags ke liye.
// ================================================================
async function seedTool() {
  const tool = await db.tool.upsert({
    where: { slug: "cron-generator" },
    update: {
      name: "Cron Expression Generator",
      category: "dev",
      seoTitle:
        "Cron Expression Generator — Build & Test Cron Schedules Free",
      metaDesc:
        "Build cron expressions visually or paste any crontab to decode it. See plain-English descriptions and next run times in your timezone. 100% free, no signup.",
      config: { renderer: "standard", version: "1.0.0" },
    },
    create: {
      slug: "cron-generator",
      name: "Cron Expression Generator",
      category: "dev",
      status: "draft",
      seoTitle:
        "Cron Expression Generator — Build & Test Cron Schedules Free",
      metaDesc:
        "Build cron expressions visually or paste any crontab to decode it. See plain-English descriptions and next run times in your timezone. 100% free, no signup.",
      locale: "en",
      config: { renderer: "standard", version: "1.0.0" },
    },
  });
  console.log(`✔ Tool upserted: ${tool.slug} (id: ${tool.id})`);
  return tool;
}

// ================================================================
// SECTION 2: Input Fields (10 rows)
// ----------------------------------------------------------------
// Yeh wo fields hain jo Phase D mein dynamic form render karenga.
// fieldType: text | number | select | date | currency
// validation: JSONB — zod schema isse dynamically banega
// options: sirf select fields ke liye
// displayOrder: form mein upar se neeche ka order
// ================================================================
async function seedInputs(toolId: string) {
  const inputs = [
    {
      fieldKey: "expression",
      label: "Cron Expression",
      fieldType: "text",
      validation: { required: false, maxLength: 100 },
      options: null,
      displayOrder: 1,
    },
    {
      fieldKey: "format",
      label: "Format",
      fieldType: "select",
      validation: { required: true },
      options: [
        { label: "5-field (Standard Unix)", value: "5-field" },
        { label: "6-field (Seconds — Quartz/AWS)", value: "6-field" },
      ],
      displayOrder: 2,
    },
    {
      fieldKey: "minute",
      label: "Minute",
      fieldType: "number",
      validation: { min: 0, max: 59 },
      options: null,
      displayOrder: 3,
    },
    {
      fieldKey: "hour",
      label: "Hour",
      fieldType: "number",
      validation: { min: 0, max: 23 },
      options: null,
      displayOrder: 4,
    },
    {
      fieldKey: "day_of_month",
      label: "Day of Month",
      fieldType: "number",
      validation: { min: 1, max: 31 },
      options: null,
      displayOrder: 5,
    },
    {
      fieldKey: "month",
      label: "Month",
      fieldType: "number",
      validation: { min: 1, max: 12 },
      options: null,
      displayOrder: 6,
    },
    {
      fieldKey: "day_of_week",
      label: "Day of Week",
      fieldType: "number",
      validation: { min: 0, max: 6, description: "0 = Sunday" },
      options: null,
      displayOrder: 7,
    },
    {
      fieldKey: "seconds",
      label: "Seconds (6-field only)",
      fieldType: "number",
      validation: { min: 0, max: 59, condition: "format === '6-field'" },
      options: null,
      displayOrder: 8,
    },
    {
      fieldKey: "timezone",
      label: "Timezone",
      fieldType: "select",
      validation: { required: true },
      options: [
        { label: "UTC", value: "UTC" },
        { label: "Asia/Karachi (PKT)", value: "Asia/Karachi" },
        { label: "Asia/Dubai (GST)", value: "Asia/Dubai" },
        { label: "Asia/Riyadh (AST)", value: "Asia/Riyadh" },
        { label: "Asia/Kolkata (IST)", value: "Asia/Kolkata" },
        { label: "Asia/Singapore (SGT)", value: "Asia/Singapore" },
        { label: "Asia/Tokyo (JST)", value: "Asia/Tokyo" },
        { label: "Europe/London (GMT/BST)", value: "Europe/London" },
        { label: "Europe/Berlin (CET)", value: "Europe/Berlin" },
        { label: "America/New_York (EST)", value: "America/New_York" },
        { label: "America/Chicago (CST)", value: "America/Chicago" },
        { label: "America/Los_Angeles (PST)", value: "America/Los_Angeles" },
        { label: "Australia/Sydney (AEDT)", value: "Australia/Sydney" },
      ],
      displayOrder: 9,
    },
    {
      fieldKey: "next_count",
      label: "Next Runs to Show",
      fieldType: "select",
      validation: { required: true },
      options: [
        { label: "5", value: "5" },
        { label: "10", value: "10" },
        { label: "20", value: "20" },
      ],
      displayOrder: 10,
    },
  ];

  for (const input of inputs) {
    await db.toolInput.upsert({
      where: {
        toolId_fieldKey: { toolId, fieldKey: input.fieldKey },
      },
      update: {
        label: input.label,
        fieldType: input.fieldType,
        validation: input.validation,
        options: input.options as any,
        displayOrder: input.displayOrder,
      },
      create: {
        toolId,
        fieldKey: input.fieldKey,
        label: input.label,
        fieldType: input.fieldType,
        validation: input.validation,
        options: input.options as any,
        displayOrder: input.displayOrder,
      },
    });
  }
  console.log(`✔ ${inputs.length} input fields upserted`);
}

// ================================================================
// SECTION 3: Datasets (3 rows — presets, special chars, macros)
// ----------------------------------------------------------------
// Yeh static reference data hai jo UI aur engine dono padhenge.
// Ham deleteMany + createMany use kar rahe hain kyunki ToolDataset
// table mein compound unique constraint nahi hai — is se har seed
// run par fresh data aata hai, duplicate nahi bante.
// ================================================================
async function seedDatasets(toolId: string) {
  // Pehle is tool ke saare datasets delete karo (fresh refresh)
  await db.toolDataset.deleteMany({ where: { toolId } });

  await db.toolDataset.createMany({
    data: [
      {
        toolId,
        datasetKey: "presets",
        payload: [
          { label: "Every minute", expression: "* * * * *" },
          { label: "Every 5 minutes", expression: "*/5 * * * *" },
          { label: "Every 15 minutes", expression: "*/15 * * * *" },
          { label: "Every hour", expression: "0 * * * *" },
          { label: "Every day at midnight", expression: "0 0 * * *" },
          { label: "Every day at 9 AM", expression: "0 9 * * *" },
          { label: "Weekdays at 9 AM", expression: "0 9 * * 1-5" },
          { label: "Every Monday", expression: "0 0 * * 1" },
          { label: "First day of month", expression: "0 0 1 * *" },
          { label: "Every Sunday", expression: "0 0 * * 0" },
        ],
      },
      {
        toolId,
        datasetKey: "special_characters",
        payload: [
          { char: "*", meaning: "Every value", example: "* * * * *" },
          { char: ",", meaning: "List of values", example: "1,15" },
          { char: "-", meaning: "Range", example: "9-17" },
          { char: "/", meaning: "Step", example: "*/5" },
          {
            char: "?",
            meaning: "No specific value (Quartz)",
            example: "0 0 10 ? * *",
          },
          {
            char: "L",
            meaning: "Last day/weekday of month",
            example: "L / 6L",
          },
          {
            char: "W",
            meaning: "Nearest weekday",
            example: "15W",
          },
        ],
      },
      {
        toolId,
        datasetKey: "macros",
        payload: [
          { macro: "@hourly", expands_to: "0 * * * *" },
          { macro: "@daily", expands_to: "0 0 * * *" },
          { macro: "@weekly", expands_to: "0 0 * * 0" },
          { macro: "@monthly", expands_to: "0 0 1 * *" },
          { macro: "@yearly", expands_to: "0 0 1 1 *" },
        ],
      },
    ],
  });
  console.log(`✔ 3 datasets created (presets, special_characters, macros)`);
}

// ================================================================
// SECTION 4: Content Blocks (intro, howto, faq)
// ----------------------------------------------------------------
// Yeh SEO content hai jo Phase D (render) aur Phase F (JSON-LD schema)
// dono mein use hoga.
// ================================================================
async function seedContent(toolId: string) {
  await db.toolContent.deleteMany({ where: { toolId } });

  await db.toolContent.createMany({
    data: [
      {
        toolId,
        blockType: "intro",
        locale: "en",
        orderIdx: 1,
        content: {
          heading:
            "Cron Expression Generator — Build, Decode & Test Cron Schedules",
          body: "Build cron expressions visually or paste any crontab to decode it. See plain-English descriptions and next run times in your timezone. 100% free, no signup, runs entirely in your browser.",
        },
      },
      {
        toolId,
        blockType: "howto",
        locale: "en",
        orderIdx: 2,
        content: {
          steps: [
            {
              name: "Choose your cron format",
              text: "Select 5-field (standard Unix) or 6-field (adds seconds for Quartz, Spring, AWS EventBridge).",
            },
            {
              name: "Set your schedule",
              text: "Use the visual fields or paste an existing expression — the two stay in sync automatically.",
            },
            {
              name: "Pick a timezone",
              text: "Choose your IANA timezone so the next run times show in your local time. DST is handled automatically.",
            },
            {
              name: "Copy the expression",
              text: "One click to copy the cron expression, plus a plain-English description and next 5/10/20 run times.",
            },
          ],
        },
      },
      {
        toolId,
        blockType: "faq",
        locale: "en",
        orderIdx: 3,
        content: [
          {
            q: "What is a cron expression?",
            a: "A string of 5 (or 6) fields that defines a recurring schedule for Unix cron and schedulers.",
          },
          {
            q: "What do the five cron fields mean?",
            a: "Minute (0–59), Hour (0–23), Day of Month (1–31), Month (1–12), Day of Week (0–6/7, Sunday=0 or 7).",
          },
          {
            q: "What do the special characters mean?",
            a: "* every value, , list, - range, / step, ? no-specific (Quartz), L last, W weekday.",
          },
          {
            q: "What is the difference between 5-field and 6-field cron?",
            a: "5-field is standard Unix; 6-field adds seconds at the start (Quartz, Spring, AWS EventBridge).",
          },
          {
            q: "Why does my job run on both the 1st and every Friday?",
            a: "Standard cron uses OR logic when both day-of-month and day-of-week are restricted.",
          },
          {
            q: "Which timezone does cron use?",
            a: "The server's timezone unless the scheduler specifies one (Kubernetes timeZone, EventBridge Scheduler).",
          },
          {
            q: "Is this cron generator free and private?",
            a: "Yes — 100% browser-based, no signup, no data sent to server.",
          },
          {
            q: "Can I paste an existing cron expression to decode it?",
            a: "Yes — paste any valid 5/6-field expression and fields will populate automatically.",
          },
        ],
      },
    ],
  });
  console.log(`✔ 3 content blocks created (intro, howto, faq)`);
}

// ================================================================
// SECTION 5: Calculation Rules (engine mapping)
// ----------------------------------------------------------------
// Phase C mein hum registry/tools.config.ts mein 'cron-generator' ko
// cronEngine function se map karenge. DB mein rule_key future mein
// A/B testing ya versioned formulas ke liye useful hoga.
// ================================================================
async function seedRules(toolId: string) {
  await db.calculationRule.deleteMany({ where: { toolId } });

  await db.calculationRule.create({
    data: {
      toolId,
      ruleKey: "cron_standard_v1",
      expression: "cronEngine",
      conditions: { formats: ["5-field", "6-field"] },
      priority: 0,
    },
  });
  console.log(`✔ 1 calculation rule created (cron_standard_v1)`);
}

// ================================================================
// MAIN — Orchestration
// ================================================================
async function main() {
  console.log("🌱 Starting seed for 'cron-generator'...\n");

  const tool = await seedTool();
  await seedInputs(tool.id);
  await seedDatasets(tool.id);
  await seedContent(tool.id);
  await seedRules(tool.id);

  console.log("\n✅ Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });