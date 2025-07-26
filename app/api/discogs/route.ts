import { NextRequest, NextResponse } from "next/server";
import { parseDiscogsUrl } from "@/lib/discogs";

// Import disconnect library
import { Client as DiscogsClient } from "disconnect";

export async function POST(request: NextRequest) {
  console.log("API Route: Received request");

  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      console.error("API Route: No URL provided");
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    console.log("API Route: Processing URL:", url);

    // Parse the Discogs URL
    const urlInfo = parseDiscogsUrl(url);

    if (!urlInfo.type || !urlInfo.id) {
      console.error("API Route: Invalid Discogs URL");
      return NextResponse.json(
        {
          error:
            "Invalid Discogs URL. Please provide a valid release, master, artist, or label URL.",
        },
        { status: 400 }
      );
    }

    // Get API token from environment
    const token = process.env.DISCOGS_API_TOKEN;

    if (!token) {
      console.error("API Route: No API token configured");
      return NextResponse.json(
        {
          error:
            "Discogs API token not configured. Please set DISCOGS_API_TOKEN in .env.local",
        },
        { status: 500 }
      );
    }

    // Initialize Discogs client
    console.log("API Route: Initializing Discogs client");
    const dis = new DiscogsClient({
      userToken: token,
    });

    // Create database instance
    const db = dis.database();

    try {
      let data;

      console.log(`API Route: Fetching ${urlInfo.type} with ID ${urlInfo.id}`);

      // Fetch data based on URL type
      switch (urlInfo.type) {
        case "release":
          data = await new Promise((resolve, reject) => {
            db.getRelease(urlInfo.id!, (err: unknown, release: unknown) => {
              if (err) reject(err);
              else resolve(release);
            });
          });
          break;

        case "master":
          data = await new Promise((resolve, reject) => {
            db.getMaster(urlInfo.id!, (err: unknown, master: unknown) => {
              if (err) reject(err);
              else resolve(master);
            });
          });
          break;

        case "artist":
          data = await new Promise((resolve, reject) => {
            db.getArtist(urlInfo.id!, (err: unknown, artist: unknown) => {
              if (err) reject(err);
              else resolve(artist);
            });
          });
          break;

        case "label":
          data = await new Promise((resolve, reject) => {
            db.getLabel(urlInfo.id!, (err: unknown, label: unknown) => {
              if (err) reject(err);
              else resolve(label);
            });
          });
          break;

        default:
          throw new Error("Unsupported URL type");
      }

      console.log("API Route: Successfully fetched data");
      console.log("API Route: Data keys:", Object.keys(data as object));

      return NextResponse.json({
        success: true,
        type: urlInfo.type,
        data,
      });
    } catch (discogsError: unknown) {
      console.error("API Route: Discogs API error:", discogsError);

      // Type guard for error objects with statusCode
      if (
        discogsError &&
        typeof discogsError === "object" &&
        "statusCode" in discogsError
      ) {
        const error = discogsError as { statusCode: number; message?: string };

        if (error.statusCode === 404) {
          return NextResponse.json(
            { error: "Item not found on Discogs" },
            { status: 404 }
          );
        }

        if (error.statusCode === 401) {
          return NextResponse.json(
            { error: "Invalid API token. Please check your DISCOGS_API_TOKEN" },
            { status: 401 }
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
    console.error("API Route: General error:", error);

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
