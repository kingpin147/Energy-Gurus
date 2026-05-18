import "dotenv/config";
import { db } from "../src/db";
import { brands, epcInstallers } from "../src/db/schema";

async function main() {
    console.log("🌱 Starting migration to verify all existing brands and EPCs...");
    
    const allBrands = await db.select().from(brands);
    console.log(`🔍 Total Brands in DB: ${allBrands.length}`);
    allBrands.forEach(b => console.log(`  - ${b.brandName}: isVerified = ${b.isVerified}`));

    const allEpcs = await db.select().from(epcInstallers);
    console.log(`🔍 Total EPCs in DB: ${allEpcs.length}`);
    allEpcs.forEach(e => console.log(`  - ${e.companyName}: isVerified = ${e.isVerified}`));

    const brandResult = await db.update(brands).set({ isVerified: true }).returning({ id: brands.id, name: brands.brandName });
    console.log(`✅ Updated ${brandResult.length} existing brands to verified:`);
    brandResult.forEach(b => console.log(`  - ${b.name} (${b.id})`));

    const epcResult = await db.update(epcInstallers).set({ isVerified: true }).returning({ id: epcInstallers.id, name: epcInstallers.companyName });
    console.log(`✅ Updated ${epcResult.length} existing EPC installers to verified:`);
    epcResult.forEach(e => console.log(`  - ${e.name} (${e.id})`));
    
    console.log("🎉 Database verification alignment complete successfully!");
}

main().catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
});
