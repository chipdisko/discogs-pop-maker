import { NextRequest, NextResponse } from "next/server";
import { Client as DiscogsClient } from "disconnect";
import type { PriceSuggestionsResponse } from "../../../../src/infrastructure/external/DiscogsApiTypes";

export async function POST(request: NextRequest) {
  console.log("Price Suggestions API: Received request");

  try {
    const body = await request.json();
    const { releaseId } = body;

    if (!releaseId) {
      console.error("Price Suggestions API: No release ID provided");
      return NextResponse.json(
        { error: "Release ID is required" },
        { status: 400 }
      );
    }

    console.log("Price Suggestions API: Processing release ID:", releaseId);

    // Get API token from environment
    const token = process.env.DISCOGS_API_TOKEN;

    if (!token) {
      console.error("Price Suggestions API: No API token configured");
      return NextResponse.json(
        {
          error:
            "Discogs API token not configured. Please set DISCOGS_API_TOKEN in .env.local",
        },
        { status: 500 }
      );
    }

    // Initialize Discogs client
    console.log("Price Suggestions API: Initializing Discogs client");
    const dis = new DiscogsClient({
      userToken: token,
    });

    // Create marketplace instance
    const marketplace = (dis as Record<string, any>).marketplace();

    try {
      console.log(
        "Price Suggestions API: Fetching price suggestions for release ID:",
        releaseId
      );

      // Fetch price suggestions
      const priceSuggestions = await new Promise((resolve, reject) => {
        marketplace.getPriceSuggestions(
          releaseId,
          (err: unknown, suggestions: unknown) => {
            if (err) {
              console.error(
                "Price Suggestions API: Discogs API error details:",
                err
              );
              reject(err);
            } else {
              console.log(
                "Price Suggestions API: Raw suggestions data:",
                suggestions
              );
              resolve(suggestions);
            }
          }
        );
      });

      console.log(
        "Price Suggestions API: Successfully fetched price suggestions"
      );

      // Transform the data to match our interface
      const suggestions = priceSuggestions as Record<
        string,
        { value: number; currency: string }
      >;

      // 価格提案データが空の場合は404を返す
      if (!suggestions || Object.keys(suggestions).length === 0) {
        return NextResponse.json(
          {
            error: "No price suggestions available for this release",
            details: "This release may not have enough market data",
          },
          { status: 404 }
        );
      }

      const transformedData = Object.entries(suggestions).map(
        ([condition, data]) => ({
          condition,
          price: Math.floor(data.value || 0), // 小数点以下を切り捨て
          currency: data.currency || "USD",
        })
      );

      const response: PriceSuggestionsResponse = {
        success: true,
        data: transformedData,
      };

      return NextResponse.json(response);
    } catch (discogsError: unknown) {
      console.error("Price Suggestions API: Discogs API error:", discogsError);

      // Type guard for error objects with statusCode
      if (
        discogsError &&
        typeof discogsError === "object" &&
        "statusCode" in discogsError
      ) {
        const error = discogsError as { statusCode: number; message?: string };

        if (error.statusCode === 404) {
          return NextResponse.json(
            {
              error: "Price suggestions not found for this release",
              details:
                "This release may not have enough market data, or seller profile may not be configured",
            },
            { status: 404 }
          );
        }

        if (error.statusCode === 401) {
          return NextResponse.json(
            { error: "Invalid API token. Please check your DISCOGS_API_TOKEN" },
            { status: 401 }
          );
        }

        if (error.statusCode === 403) {
          return NextResponse.json(
            { error: "Access denied. Seller profile may not be configured." },
            { status: 403 }
          );
        }

        if (error.statusCode === 429) {
          return NextResponse.json(
            { error: "Rate limit exceeded. Please try again later." },
            { status: 429 }
          );
        }

        return NextResponse.json(
          { error: `Discogs API error: ${error.message || "Unknown error"}` },
          { status: 500 }
        );
      }

      // Fallback for unknown error types
      return NextResponse.json(
        { error: "Discogs API error: Unknown error occurred" },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Price Suggestions API: General error:", error);

    // Type guard for error objects with message
    if (error && typeof error === "object" && "message" in error) {
      const err = error as { message: string };
      return NextResponse.json(
        { error: `Server error: ${err.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Server error: Unknown error occurred" },
      { status: 500 }
    );
  }
}
