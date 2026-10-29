import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getToolConfig } from "@/registry/tools.config";

const bodySchema = z.object({
  inputs: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.null()])
  ),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const config = getToolConfig(slug);

  if (!config?.enabled) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request: inputs object required" },
      { status: 400 }
    );
  }

  try {
    const inputs = parsed.data.inputs as Record<string, string | number | boolean>;
    const result = await config.engine(inputs);
    return NextResponse.json({ result });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Calculation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}