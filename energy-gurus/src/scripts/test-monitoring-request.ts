import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { db } from '../db';
import { monitoringRequests } from '../db/schema';

async function main() {
  console.log('Testing insertion into monitoring_requests table...');
  
  try {
    const rawData = {
      customerName: 'Test User',
      address: '123 Fake Street, Tech City',
      contactNo: '0300-1234567',
      email: 'test@example.com',
      cnic: '12345-1234567-1',
      customerType: 'Residential',
      systemSize: '1',
      package: '1800',
      monitoringHours: '1',
      paymentPlan: '0.2',
      amountPayable: 'PKR 4,320 per quarter (billed every 3 months) — approx. PKR 1,440/mo equivalent'
    };

    const inserted = await db.insert(monitoringRequests).values(rawData).returning();
    
    console.log('Success! Inserted record:');
    console.log(inserted);
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing insertion:', error);
    process.exit(1);
  }
}

main();
