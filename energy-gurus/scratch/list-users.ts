import "dotenv/config";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function listUsers() {
  const users = await clerkClient.users.getUserList();
  console.log("Found Users in Clerk:");
  users.data.forEach(u => {
    console.log(`- ${u.emailAddresses.map(e => e.emailAddress).join(", ")} (${u.id})`);
  });
  process.exit(0);
}

listUsers();
