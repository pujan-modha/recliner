import { NextResponse } from "next/server";
import { makeResendRequest, handleApiResponse } from "@/app/common";

export async function POST(request: Request) {
  const { apiKey, ...emailData } = await request.json();

  if (
    !apiKey ||
    !emailData.from ||
    !emailData.to ||
    !emailData.subject ||
    (!emailData.text && !emailData.html)
  ) {
    return NextResponse.json(
      { success: false, message: "Missing required fields" },
      { status: 400 }
    );
  }

  const result = await makeResendRequest("/emails", "POST", apiKey, emailData);
  return handleApiResponse(result);
}
