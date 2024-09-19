import { NextResponse } from "next/server";

export const RESEND_API_URL = "https://api.resend.com";

export interface ResendApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export async function makeResendRequest(
  endpoint: string,
  method: string,
  apiKey: string,
  body?: object
): Promise<ResendApiResponse> {
  try {
    const response = await fetch(`${RESEND_API_URL}${endpoint}`, {
      method,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: "Request successful", data };
    } else {
      return {
        success: false,
        message: data.message || "Request failed",
        data,
      };
    }
  } catch (error) {
    console.error("Error making Resend API request:", error);
    return { success: false, message: "Internal server error" };
  }
}

export function handleApiResponse(result: ResendApiResponse): NextResponse {
  return NextResponse.json(
    { success: result.success, message: result.message, data: result.data },
    { status: result.success ? 200 : 500 }
  );
}
