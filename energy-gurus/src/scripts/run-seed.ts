import { seedDummyData } from "../lib/seed";

(async () => {
  try {
    await seedDummyData();
    console.log("✅ Seed complete");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
