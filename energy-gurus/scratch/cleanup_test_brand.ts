
import { config } from 'dotenv';
config();

import { db } from '../src/db';
import { brands, users, inquiries, reviews, epcInstallers } from '../src/db/schema';
import { eq, or } from 'drizzle-orm';

async function cleanupTestBrand() {
    console.log('Searching for brand with name "test"...');
    
    const testBrands = await db.select().from(brands).where(eq(brands.brandName, 'test'));
    
    if (testBrands.length === 0) {
        console.log('No brand named "test" found.');
        return;
    }
    
    for (const brand of testBrands) {
        console.log(`Cleaning up brand: ${brand.brandName} (ID: ${brand.id})`);
        const userId = brand.userId;

        if (userId) {
            console.log(`Cleaning up records for user: ${userId}`);
            
            // Delete reviews where user is the author
            await db.delete(reviews).where(eq(reviews.authorId, userId));
            console.log('Reviews deleted.');

            // Delete reviews where brand is the target
            await db.delete(reviews).where(or(
                eq(reviews.targetId, brand.id),
                eq(reviews.targetId, userId) // sometimes users target users
            ));
            
            // Delete inquiries
            await db.delete(inquiries).where(or(
                eq(inquiries.senderId, userId),
                eq(inquiries.receiverId, userId)
            ));
            console.log('Inquiries deleted.');

            // Delete EPC records if any
            await db.delete(epcInstallers).where(eq(epcInstallers.userId, userId));
        }

        // Delete brand
        await db.delete(brands).where(eq(brands.id, brand.id));
        console.log('Brand deleted.');

        // Delete user
        if (userId) {
            await db.delete(users).where(eq(users.id, userId));
            console.log('User deleted.');
        }
    }
    
    console.log('Cleanup complete.');
    process.exit(0);
}

cleanupTestBrand().catch(err => {
    console.error('Cleanup failed:', err);
    process.exit(1);
});
