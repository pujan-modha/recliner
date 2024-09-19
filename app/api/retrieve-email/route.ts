import { NextResponse } from "next/server";
import { makeResendRequest, handleApiResponse } from "@/app/common";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const apiKey = searchParams.get("apiKey");

  if (!id || !apiKey) {
    return NextResponse.json(
      { success: false, message: "Missing id or apiKey" },
      { status: 400 }
    );
  }

  const result = await makeResendRequest(`/emails/${id}`, "GET", apiKey);
  return handleApiResponse(result);
}
