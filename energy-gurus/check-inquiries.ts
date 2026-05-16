import { db } from "./src/db";
import { inquiries } from "./src/db/schema";
import { eq, count } from "drizzle-orm";

async function check() {
    const [res] = await db.select({ value: count() }).from(inquiries).where(eq(inquiries.inquiryType, "public" as any));
    console.log("Public Inquiries Count:", res.value);
    
    const all = await db.select().from(inquiries).where(eq(inquiries.inquiryType, "public" as any)).limit(5);
    console.log("Latest Public Inquiries:", JSON.stringify(all, null, 2));
}

check().catch(console.error);
