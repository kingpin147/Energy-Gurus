const dotenv = require('dotenv');
dotenv.config();
const { neon } = require('@neondatabase/serverless');

async function check() {
  const sql = neon(process.env.DATABASE_URL);
  const ads = await sql`SELECT * FROM ads WHERE placement = 'skyscraper_left'`;
  console.log(JSON.stringify(ads, null, 2));
}
check().catch(console.error);
