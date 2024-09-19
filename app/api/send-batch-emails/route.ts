import { NextResponse } from "next/server";
import { makeResendRequest, handleApiResponse } from "@/app/common";

export async function POST(request: Request) {
  const { apiKey, ...batchData } = await request.json();

  if (
    !apiKey ||
    !batchData.from ||
    !batchData.to ||
    !batchData.subject ||
    (!batchData.text && !batchData.html)
  ) {
    return NextResponse.json(
      { success: false, message: "Missing required fields" },
      { status: 400 }
    );
  }

  const result = await makeResendRequest(
    "/emails/batch",
    "POST",
    apiKey,
    batchData
  );
  return handleApiResponse(result);
}
