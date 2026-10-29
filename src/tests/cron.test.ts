import { describe, it, expect } from "vitest";
import { cronEngine, __internal } from "@/lib/engine/cron";

describe("CronEngine — basic parsing", () => {
  it("parses a simple 5-field expression", async () => {
    const result = await cronEngine({
      expression: "*/5 * * * *",
      format: "5-field",
      timezone: "UTC",
      next_count: 5,
    });
    expect(result.expression).toBe("*/5 * * * *");
    expect(result.description?.toLowerCase()).toContain("every 5 minutes");
    expect(result.nextRuns).toHaveLength(5);
    expect(result.nextRuns?.[0].iso).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("builds expression from visual fields when raw not provided", async () => {
    const result = await cronEngine({
      format: "5-field",
      minute: "0",
      hour: "9",
      day_of_month: "*",
      month: "*",
      day_of_week: "1-5",
      timezone: "UTC",
      next_count: 5,
    });
    expect(result.expression).toBe("0 9 * * 1-5");
    expect(result.description?.toLowerCase()).toContain("monday");
  });

  it("prefers raw expression over visual fields", async () => {
    const result = await cronEngine({
      expression: "0 0 * * *",
      format: "5-field",
      minute: "30", // should be ignored
      hour: "5", // should be ignored
      timezone: "UTC",
      next_count: 1,
    });
    expect(result.expression).toBe("0 0 * * *");
  });
});

describe("CronEngine — macros", () => {
  it("expands @daily to 0 0 * * *", async () => {
    const result = await cronEngine({
      expression: "@daily",
      format: "5-field",
      timezone: "UTC",
      next_count: 3,
    });
    expect(result.expression).toBe("0 0 * * *");
    expect(result.warnings?.some((w) => w.includes("@daily"))).toBe(true);
    expect(result.nextRuns).toHaveLength(3);
  });

  it("expands @hourly to 0 * * * *", async () => {
    const result = await cronEngine({
      expression: "@hourly",
      format: "5-field",
      timezone: "UTC",
      next_count: 2,
    });
    expect(result.expression).toBe("0 * * * *");
  });
});

describe("CronEngine — validation", () => {
  it("throws on invalid minute (>59)", async () => {
    await expect(
      cronEngine({
        expression: "60 * * * *",
        format: "5-field",
        timezone: "UTC",
        next_count: 1,
      })
    ).rejects.toThrow(/Invalid cron expression/i);
  });

  it("throws on invalid hour (>23)", async () => {
    await expect(
      cronEngine({
        expression: "* 25 * * *",
        format: "5-field",
        timezone: "UTC",
        next_count: 1,
      })
    ).rejects.toThrow(/Invalid cron expression/i);
  });

  it("throws on empty input", async () => {
    await expect(
      cronEngine({
        format: "5-field",
        timezone: "UTC",
        next_count: 1,
      })
    ).rejects.toThrow();
  });

  it("throws on invalid timezone", async () => {
    await expect(
      cronEngine({
        expression: "0 0 * * *",
        format: "5-field",
        timezone: "Mars/Olympus",
        next_count: 1,
      })
    ).rejects.toThrow(/Invalid timezone/i);
  });
});

describe("CronEngine — timezone handling", () => {
  it("respects timezone: same local hour, different UTC instants", async () => {
    const utc = await cronEngine({
      expression: "0 9 * * *",
      format: "5-field",
      timezone: "UTC",
      next_count: 1,
    });
    const karachi = await cronEngine({
      expression: "0 9 * * *",
      format: "5-field",
      timezone: "Asia/Karachi",
      next_count: 1,
    });

    // Dono ka local time 09:00 hona chahiye (kyunki cron 9 AM hai)
    expect(utc.nextRuns?.[0].local).toContain("09:00");
    expect(karachi.nextRuns?.[0].local).toContain("09:00");

    // Lekin UTC instants different honge (Karachi UTC+5)
    expect(utc.nextRuns?.[0].iso).not.toBe(karachi.nextRuns?.[0].iso);

    // Karachi ka UTC instant UTC ke 9 AM se 5 ghante pehle hoga
    const utcMs = new Date(utc.nextRuns![0].iso).getTime();
    const khiMs = new Date(karachi.nextRuns![0].iso).getTime();
    const diffHours = (utcMs - khiMs) / (1000 * 60 * 60);
    expect(diffHours).toBe(5); // Karachi = UTC+5
  });
});

describe("CronEngine — warnings", () => {
  it("warns when both DOM and DOW are restricted", async () => {
    const result = await cronEngine({
      expression: "0 0 1 * 5",
      format: "5-field",
      timezone: "UTC",
      next_count: 3,
    });
    expect(result.warnings?.some((w) => w.includes("OR logic"))).toBe(true);
  });

  it("does not warn when only DOM is restricted", async () => {
    const result = await cronEngine({
      expression: "0 0 1 * *",
      format: "5-field",
      timezone: "UTC",
      next_count: 3,
    });
    expect(result.warnings?.some((w) => w.includes("OR logic"))).toBeFalsy();
  });
});

describe("CronEngine — 6-field format", () => {
  it("accepts 6-field expressions", async () => {
    const result = await cronEngine({
      expression: "*/10 * * * * *", // every 10 seconds
      format: "6-field",
      timezone: "UTC",
      next_count: 3,
    });
    expect(result.expression).toBe("*/10 * * * * *");
    expect(result.nextRuns).toHaveLength(3);
    // Between consecutive runs should be ~10 seconds
    const t0 = new Date(result.nextRuns![0].iso).getTime();
    const t1 = new Date(result.nextRuns![1].iso).getTime();
    expect(t1 - t0).toBeGreaterThanOrEqual(9000);
    expect(t1 - t0).toBeLessThanOrEqual(11000);
  });
});

describe("CronEngine — internal helpers", () => {
  it("expandMacro handles known macros", () => {
    expect(__internal.expandMacro("@daily")).toEqual({
      expanded: "0 0 * * *",
      isMacro: true,
    });
    expect(__internal.expandMacro("0 0 * * *")).toEqual({
      expanded: "0 0 * * *",
      isMacro: false,
    });
  });

  it("detectDomDowWarning catches both restricted", () => {
    expect(__internal.detectDomDowWarning("0 0 1 * 5", "5-field")).toContain(
      "OR logic"
    );
    expect(__internal.detectDomDowWarning("0 0 1 * *", "5-field")).toBeNull();
  });
});