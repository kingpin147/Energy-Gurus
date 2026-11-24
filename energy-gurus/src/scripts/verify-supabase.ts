import 'dotenv/config';
import { db } from '../db';
import { users, podcasts, monitoringRequests, epcInstallers, news, brands, inquiries, ads, invitations } from '../db/schema';
import { count } from 'drizzle-orm';

async function verify() {
  try {
    const [u] = await db.select({ count: count() }).from(users);
    const [p] = await db.select({ count: count() }).from(podcasts);
    const [m] = await db.select({ count: count() }).from(monitoringRequests);
    const [e] = await db.select({ count: count() }).from(epcInstallers);
    const [n] = await db.select({ count: count() }).from(news);
    const [b] = await db.select({ count: count() }).from(brands);
    const [i] = await db.select({ count: count() }).from(inquiries);
    const [a] = await db.select({ count: count() }).from(ads);
    const [inv] = await db.select({ count: count() }).from(invitations);

    console.log('====================================');
    console.log('🎉 SUPABASE DATABASE LIVE DATA COUNTS:');
    console.log(`- Users: ${u.count}`);
    console.log(`- Podcasts: ${p.count}`);
    console.log(`- Monitoring Requests: ${m.count}`);
    console.log(`- EPC Installers: ${e.count}`);
    console.log(`- News Articles: ${n.count}`);
    console.log(`- Brands: ${b.count}`);
    console.log(`- Inquiries: ${i.count}`);
    console.log(`- Ads: ${a.count}`);
    console.log(`- Invitations: ${inv.count}`);
    console.log('====================================');

    process.exit(0);
  } catch (err: any) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
}

verify();
