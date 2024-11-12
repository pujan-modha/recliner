import { NextResponse } from "next/server";
import { makeResendRequest, handleApiResponse } from "@/app/common";

/**
 * POST handler for sending batch emails
 * Endpoint: /api/send-batch-emails
 * 
 * @param request - Request object containing API key and batch of emails
 * @returns NextResponse with success/failure status and message
 */
export async function POST(request: Request) {
  try {
    // Extract batch data and API key from request body
    const { apiKey, batch } = await request.json();

    // Validate request parameters and batch format
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

    // Send batch request to Resend API
    const result = await makeResendRequest(
      "/emails/batch",
      "POST",
      apiKey,
      batch
    );

    // Return standardized API response
    return handleApiResponse(result);
  } catch (error) {
    // Log and handle any unexpected errors
    console.error("Error in send-batch-emails route:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while processing your request" },
      { status: 500 }
    );
  }
}
