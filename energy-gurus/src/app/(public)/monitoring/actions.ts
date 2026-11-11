'use server';

import { db } from '@/db';
import { monitoringRequests, inquiries, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { sendAdminNotificationEmail } from '@/lib/mail';

export async function submitMonitoringRequest(formData: FormData) {
  try {
    const rawData = {
      customerName: formData.get('customerName') as string,
      address: formData.get('address') as string,
      contactNo: formData.get('contactNo') as string,
      email: formData.get('email') as string,
      cnic: formData.get('cnic') as string,
      customerType: formData.get('customerType') as string,
      systemSize: formData.get('systemSize') as string,
      package: formData.get('package') as string,
      monitoringHours: formData.get('monitoringHours') as string,
      paymentPlan: formData.get('paymentPlan') as string,
      amountPayable: formData.get('amountPayable') as string
    };

    // Basic validation
    if (!rawData.customerName || !rawData.email || !rawData.contactNo) {
      return { success: false, error: 'Missing required fields' };
    }

    // Insert into database
    await db.insert(monitoringRequests).values(rawData);

    // Sync into inquiries table so it appears in Admin Support Inbox and Dashboard Overview
    try {
      const [admin] = await db.select().from(users).where(eq(users.role, "super-admin")).limit(1);
      const [fallbackAdmin] = !admin ? await db.select().from(users).where(eq(users.role, "admin")).limit(1) : [null];
      const targetAdmin = admin ?? fallbackAdmin;
      if (targetAdmin) {
        await db.insert(inquiries).values({
          receiverId: targetAdmin.id,
          guestName: rawData.customerName,
          guestEmail: rawData.email,
          guestPhone: rawData.contactNo,
          subject: `Monitoring Setup Request - ${rawData.customerName}`,
          message: `New Monitoring Setup Request:\n• Customer: ${rawData.customerName} (${rawData.customerType})\n• Contact: ${rawData.contactNo} | ${rawData.email}\n• CNIC: ${rawData.cnic}\n• Address: ${rawData.address}\n• System Size: ${rawData.systemSize}\n• Package: ${rawData.package}\n• Hours: ${rawData.monitoringHours}\n• Payment Plan: ${rawData.paymentPlan}\n• Amount Payable: ${rawData.amountPayable || 'N/A'}`,
          inquiryType: "public",
          status: "new",
          isRead: false,
          metadata: rawData,
        });
      }
    } catch (inqErr) {
      console.error('Error syncing monitoring request to inquiries table:', inqErr);
    }

    // Send email notification to admin without blocking the response
    const htmlMessage = `
        <h3>New Monitoring Setup Request</h3>
        <p><strong>Customer:</strong> ${rawData.customerName} (${rawData.customerType})</p>
        <p><strong>Contact:</strong> ${rawData.contactNo} | ${rawData.email}</p>
        <p><strong>System Size:</strong> ${
            rawData.systemSize === '1' ? '1-10kW' : 
            rawData.systemSize === '1.25' ? '10-20kW' : 
            rawData.systemSize === '1.5' ? '20-30kW' : '30kW+'
        }</p>
        <p><strong>Package:</strong> ${rawData.package === '1000' ? 'Basic' : rawData.package === '1800' ? 'Moderate' : rawData.package === '3000' ? 'Comprehensive' : 'Custom Quote needed'}</p>
        <p><strong>Amount Payable:</strong> ${rawData.amountPayable || 'N/A'}</p>
        <p><strong>Address:</strong> ${rawData.address}</p>
        <br/>
        <p><a href="https://energygurus.online/dashboard/inbox">View in Support Inbox</a> | <a href="https://energygurus.online/dashboard/monitoring/requests">View in Monitoring Requests</a></p>
    `;
    
    sendAdminNotificationEmail("New Monitoring Request Received", htmlMessage).catch(console.error);

    revalidatePath("/dashboard/inbox", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/monitoring/requests");

    return { success: true };
  } catch (error) {
    console.error('Error submitting monitoring request:', error);
    return { success: false, error: 'Failed to submit request' };
  }
}
