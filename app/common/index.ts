import { NextResponse } from "next/server";

// Base URL for Resend API endpoints
export const RESEND_API_URL = "https://api.resend.com";

/**
 * Standard response interface for Resend API operations
 */
export interface ResendApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

/**
 * Makes a request to the Resend API with proper authentication and error handling
 * @param endpoint - The API endpoint to call (e.g., '/emails')
 * @param method - HTTP method to use (GET, POST, etc.)
 * @param apiKey - Resend API authentication key
 * @param body - Optional request body for POST/PUT requests
 * @returns Promise resolving to a standardized ResendApiResponse
 */
export async function makeResendRequest(
  endpoint: string,
  method: string,
  apiKey: string,
  body?: object
): Promise<ResendApiResponse> {
  try {
    // Construct and execute the API request
    const response = await fetch(`${RESEND_API_URL}${endpoint}`, {
      method,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    const data = await response.json();

    // Handle successful responses
    if (response.ok) {
      return { success: true, message: "Request successful", data };
    } 
    
    // Handle API errors with custom messages
    return {
      success: false,
      message: data.message || "Request failed",
      data,
    };
    
  } catch (error) {
    // Handle network or parsing errors
    console.error("Error making Resend API request:", error);
    return { success: false, message: "Internal server error" };
  }
}

/**
 * Converts a ResendApiResponse into a standardized NextResponse
 * @param result - The API response to convert
 * @returns NextResponse with appropriate status code and formatted body
 */
export function handleApiResponse(result: ResendApiResponse): NextResponse {
  return NextResponse.json(
    { success: result.success, message: result.message, data: result.data },
    { status: result.success ? 200 : 500 }
  );
}
