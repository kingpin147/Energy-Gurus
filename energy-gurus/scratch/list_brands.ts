
import { config } from 'dotenv';
config();

import { db } from '../src/db';
import { brands } from '../src/db/schema';

async function listBrands() {
    const allBrands = await db.select().from(brands);
    console.log('Current Brands in DB:');
    allBrands.forEach(b => console.log(`- ${b.brandName} (ID: ${b.id})`));
    process.exit(0);
}

listBrands().catch(err => {
    console.error(err);
    process.exit(1);
});
