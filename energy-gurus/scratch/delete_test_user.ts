
import { config } from 'dotenv';
config();

import { db } from '../src/db';
import { users, reviews, inquiries } from '../src/db/schema';
import { eq, or } from 'drizzle-orm';

async function deleteTestUser() {
    console.log('Searching for user with name "test"...');
    
    const testUsers = await db.select().from(users).where(eq(users.name, 'test'));
    
    for (const user of testUsers) {
        console.log(`Deleting user: ${user.name} (ID: ${user.id})`);
        
        // Manual cleanup just in case
        await db.delete(reviews).where(eq(reviews.authorId, user.id));
        await db.delete(inquiries).where(or(
            eq(inquiries.senderId, user.id),
            eq(inquiries.receiverId, user.id)
        ));
        
        await db.delete(users).where(eq(users.id, user.id));
        console.log('User deleted.');
    }
    
    process.exit(0);
}

deleteTestUser().catch(err => {
    console.error(err);
    process.exit(1);
});
