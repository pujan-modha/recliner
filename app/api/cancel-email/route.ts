import { NextResponse } from "next/server";
import { makeResendRequest, handleApiResponse } from "@/app/common";

export async function POST(request: Request) {
  const { id, apiKey } = await request.json();

  if (!id || !apiKey) {
    return NextResponse.json(
      { success: false, message: "Missing id or apiKey" },
      { status: 400 }
    );
  }

  const result = await makeResendRequest(
    `/emails/${id}/cancel`,
    "POST",
    apiKey
  );
  return handleApiResponse(result);
}
