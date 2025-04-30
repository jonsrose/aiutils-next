import { db } from ".";
import { healthCheck } from "./schema";

export async function initializeDatabase() {
  try {
    // Insert health check row if it doesn't exist
    await db.insert(healthCheck).values({ id: 1 }).onConflictDoNothing();
  } catch (error) {
    console.log("Health check initialization error:", error);
  }
}
