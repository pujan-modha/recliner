import { NextResponse } from "next/server";
import { makeResendRequest, handleApiResponse } from "@/app/common";

/**
 * POST handler for sending individual emails
 * Endpoint: /api/send-email
 * 
 * @param request - Request object containing email data and API key
 * @returns NextResponse with success/failure status and message
 */
export async function POST(request: Request) {
  // Extract API key and email data from request body
  const { apiKey, ...emailData } = await request.json();

  // Validate required email parameters
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

  // Make API request to send the email
  const result = await makeResendRequest("/emails", "POST", apiKey, emailData);

  // Return standardized API response
  return handleApiResponse(result);
}
