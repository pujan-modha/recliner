import { NextResponse } from "next/server";
import { makeResendRequest, handleApiResponse } from "@/app/common";

/**
 * POST handler for canceling scheduled emails
 * Endpoint: /api/cancel-email
 * 
 * @param request - Request object containing email ID and API key
 * @returns NextResponse with success/failure status and message
 */
export async function POST(request: Request) {
  // Extract required parameters from request body
  const { id, apiKey } = await request.json();

  // Validate required parameters
  if (!id || !apiKey) {
    return NextResponse.json(
      { success: false, message: "Missing id or apiKey" },
      { status: 400 }
    );
  }

  // Make API request to cancel the scheduled email
  const result = await makeResendRequest(
    `/emails/${id}/cancel`,
    "POST",
    apiKey
  );

  // Return standardized API response
  return handleApiResponse(result);
}
