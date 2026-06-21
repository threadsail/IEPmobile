import { buildLlmsFullTxt, llmsTextResponse } from "@/lib/llms-content";

export function GET() {
  return llmsTextResponse(buildLlmsFullTxt());
}
