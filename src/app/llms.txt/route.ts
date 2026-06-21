import { buildLlmsTxt, llmsTextResponse } from "@/lib/llms-content";

export function GET() {
  return llmsTextResponse(buildLlmsTxt());
}
