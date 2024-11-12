import { NextResponse } from "next/server";
import { makeResendRequest, handleApiResponse } from "@/app/common";

/**
 * GET handler for retrieving email details
 * Endpoint: /api/retrieve-email
 * 
 * @param request - Request object containing query parameters
 * @returns NextResponse with email details or error message
 */
export async function GET(request: Request) {
  // Extract and parse query parameters from the URL
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const apiKey = searchParams.get("apiKey");

  // Validate required parameters
  if (!id || !apiKey) {
    return NextResponse.json(
      { success: false, message: "Missing id or apiKey" },
      { status: 400 }
    );
  }

  // Make API request to fetch email details
  const result = await makeResendRequest(`/emails/${id}`, "GET", apiKey);

  // Return standardized API response
  return handleApiResponse(result);
}
