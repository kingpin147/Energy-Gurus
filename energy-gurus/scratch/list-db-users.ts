import "dotenv/config";
import { db } from "../src/db";
import { users } from "../src/db/schema";

async function listDbUsers() {
  const allUsers = await db.select().from(users);
  console.log("Found Users in Database:");
  allUsers.forEach(u => {
    console.log(`- ${u.email} (${u.role})`);
  });
  process.exit(0);
}

listDbUsers();
