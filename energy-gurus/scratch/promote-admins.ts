import "dotenv/config";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const targetEmails = ["nomiking0072012@gmail.com", "energygurusonline@gmail.com"];

async function promoteUsers() {
  console.log("Starting promotion process...");

  for (const email of targetEmails) {
    try {
      // 1. Find user in Clerk
      const clerkUsers = await clerkClient.users.getUserList({
        emailAddress: [email],
      });

      if (clerkUsers.data.length === 0) {
        console.log(`User with email ${email} not found in Clerk.`);
        continue;
      }

      const clerkUser = clerkUsers.data[0];
      console.log(`Found Clerk user: ${clerkUser.id} (${email})`);

      // 2. Update Clerk Metadata
      await clerkClient.users.updateUserMetadata(clerkUser.id, {
        publicMetadata: {
          role: "super-admin",
        },
      });
      console.log(`Updated Clerk metadata for ${email}`);

      // 3. Update Database if user exists
      const dbUser = await db.select().from(users).where(eq(users.email, email));
      if (dbUser.length > 0) {
        await db.update(users)
          .set({ role: "super-admin" })
          .where(eq(users.email, email));
        console.log(`Updated database role for ${email}`);
      } else {
        console.log(`User ${email} not found in database (likely hasn't signed in yet).`);
      }

    } catch (error) {
      console.error(`Error promoting ${email}:`, error);
    }
  }

  console.log("Promotion process complete.");
  process.exit(0);
}

promoteUsers();
