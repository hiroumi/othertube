import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY;

  if (!key) {
    return NextResponse.json({ status: "no_key", message: "ANTHROPIC_API_KEY is not set" });
  }

  const keyPreview = `${key.slice(0, 12)}...${key.slice(-4)}`;

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: key });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16,
      messages: [{ role: "user", content: "Say: OK" }],
    });

    return NextResponse.json({
      status: "ok",
      keyPreview,
      model: "claude-sonnet-4-6",
      response: (response.content[0] as { type: string; text: string }).text,
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    const errType = (err as { status?: number }).status;
    return NextResponse.json({
      status: "error",
      keyPreview,
      error: errMsg,
      httpStatus: errType,
    });
  }
}
