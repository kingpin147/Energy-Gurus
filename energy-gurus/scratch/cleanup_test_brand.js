
import { db } from '../src/db/index.js';
import { brands, users } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

async function cleanupTestBrand() {
    console.log('Searching for brand with name "test"...');
    
    const testBrands = await db.select().from(brands).where(eq(brands.brandName, 'test'));
    
    if (testBrands.length === 0) {
        console.log('No brand named "test" found.');
        return;
    }
    
    for (const brand of testBrands) {
        console.log(`Deleting brand: ${brand.brandName} (ID: ${brand.id})`);
        
        // The deleteUser action already handles cascading if we delete the user,
        // but let's just delete the brand record first as requested.
        await db.delete(brands).where(eq(brands.id, brand.id));
        console.log('Brand deleted.');
        
        // If there's an associated user that was only for this test, we might want to delete it too.
        // But the user specifically said "this user brand".
    }
    
    process.exit(0);
}

cleanupTestBrand().catch(err => {
    console.error(err);
    process.exit(1);
});
