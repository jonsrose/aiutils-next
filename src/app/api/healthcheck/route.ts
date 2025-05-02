import { db } from "@/db";
import { healthCheck } from "@/db/schema";
import { initializeDatabase } from "@/db/init";
import { eq } from "drizzle-orm";

// Initialize on server start
initializeDatabase();

export async function GET() {
  try {
    // Update the last_ping timestamp

    console.log("Updating health check");

    const now = new Date();

    await db
      .update(healthCheck)
      .set({ lastPing: now })
      .where(eq(healthCheck.id, 1));

    console.log("Health check updated to ", now);

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Health check error:", error);
    return new Response("Error", { status: 500 });
  }
}
