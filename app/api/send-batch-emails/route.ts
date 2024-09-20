import { NextResponse } from "next/server";
import { makeResendRequest, handleApiResponse } from "@/app/common";

export async function POST(request: Request) {
  try {
    const { apiKey, batch } = await request.json();

    if (
      !apiKey ||
      !Array.isArray(batch) ||
      batch.length === 0 ||
      !batch.every(email => 
        email.from &&
        email.to &&
        email.subject &&
        (email.text || email.html)
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields or invalid batch format" },
        { status: 400 }
      );
    }

    // Send the batch array directly, not wrapped in an object
    const result = await makeResendRequest(
      "/emails/batch",
      "POST",
      apiKey,
      batch
    );
    return handleApiResponse(result);
  } catch (error) {
    console.error("Error in send-batch-emails route:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while processing your request" },
      { status: 500 }
    );
  }
}
