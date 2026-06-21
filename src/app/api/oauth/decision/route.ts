import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const decision = formData.get("decision");
  const authorizationId = formData.get("authorization_id");

  if (typeof authorizationId !== "string" || !authorizationId.trim()) {
    return NextResponse.json({ error: "Missing authorization_id" }, { status: 400 });
  }

  const supabase = await createClient();

  if (decision === "approve") {
    const { data, error } =
      await supabase.auth.oauth.approveAuthorization(authorizationId);

    if (error || !data?.redirect_url) {
      return NextResponse.json(
        { error: error?.message ?? "Failed to approve authorization" },
        { status: 400 }
      );
    }

    return NextResponse.redirect(data.redirect_url);
  }

  if (decision === "deny") {
    const { data, error } =
      await supabase.auth.oauth.denyAuthorization(authorizationId);

    if (error || !data?.redirect_url) {
      return NextResponse.json(
        { error: error?.message ?? "Failed to deny authorization" },
        { status: 400 }
      );
    }

    return NextResponse.redirect(data.redirect_url);
  }

  return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
}
