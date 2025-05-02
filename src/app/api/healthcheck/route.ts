export const runtime = "nodejs";

import { db } from "@/db";
import { healthCheck } from "@/db/schema";
import { initializeDatabase } from "@/db/init";
import { eq } from "drizzle-orm";

export async function GET() {
  console.log("=== HEALTH CHECK ROUTE START ===");

  try {
    // Move initialization inside the handler
    await initializeDatabase();

    console.log("Attempting database update...");
    const now = new Date();

    await db
      .update(healthCheck)
      .set({ lastPing: now })
      .where(eq(healthCheck.id, 1));

    console.log("=== HEALTH CHECK SUCCESS ===", now);
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
    console.error("=== HEALTH CHECK ERROR ===", error);
    return new Response("Error", { status: 500 });
  }
}
