import { NextResponse } from "next/server";
import { makeResendRequest, handleApiResponse } from "@/app/common";

/**
 * PATCH handler for updating scheduled emails
 * Endpoint: /api/update-email
 * 
 * @param request - Request object containing email ID, API key, and update data
 * @returns NextResponse with success/failure status and message
 */
export async function PATCH(request: Request) {
  const { id, apiKey, ...updateData } = await request.json();

  if (!id || !apiKey) {
    return NextResponse.json(
      { success: false, message: "Missing id or apiKey" },
      { status: 400 }
    );
  }

  const result = await makeResendRequest(
    `/emails/${id}`,
    "PATCH",
    apiKey,
    updateData
  );
  return handleApiResponse(result);
}
