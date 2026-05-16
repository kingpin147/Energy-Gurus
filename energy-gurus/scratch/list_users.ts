
import { config } from 'dotenv';
config();

import { db } from '../src/db';
import { users } from '../src/db/schema';

async function listUsers() {
    const allUsers = await db.select().from(users);
    console.log('Current Users in DB:');
    allUsers.forEach(u => console.log(`- ${u.name} / ${u.email} (${u.role})`));
    process.exit(0);
}

listUsers().catch(err => {
    console.error(err);
    process.exit(1);
});
