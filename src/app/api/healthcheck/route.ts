export const runtime = "nodejs";
export const maxDuration = 10; // ensures function doesn't timeout too quickly
export const dynamic = "force-dynamic"; // prevents caching at the edge

import { db } from "@/db";
import { healthCheck } from "@/db/schema";
// import { initializeDatabase } from "@/db/init";
import { eq } from "drizzle-orm";

export async function GET() {
  // Use console.info for higher visibility in Vercel logs
  console.info("[VERCEL_LOG] Health check starting", {
    timestamp: new Date().toISOString(),
  });

  try {
    // Move initialization inside the handler
    // await initializeDatabase();

    const now = new Date();

    // Log the attempt
    console.info("[VERCEL_LOG] Attempting database update", {
      timestamp: now.toISOString(),
      table: "health_check",
    });

    await db
      .update(healthCheck)
      .set({ lastPing: now })
      .where(eq(healthCheck.id, 1));

    // Log success with structured data
    console.info("[VERCEL_LOG] Health check completed", {
      status: "success",
      timestamp: now.toISOString(),
      operation: "update",
    });

    return new Response("OK", {
      status: 200,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    // Structured error logging
    console.error("[VERCEL_LOG] Health check failed", {
      error: (error as Error).message,
      stack: (error as Error).stack,
      timestamp: new Date().toISOString(),
    });
    return new Response("Error", { status: 500 });
  }
}
