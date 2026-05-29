import { db } from "./src/db";
import { liveQA } from "./src/db/schema";

async function checkSessions() {
    const sessions = await db.select().from(liveQA);
    console.log("All Sessions:", JSON.stringify(sessions, null, 2));
    process.exit(0);
}

checkSessions();
