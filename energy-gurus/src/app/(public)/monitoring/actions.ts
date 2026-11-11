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

    // Friendly label mappings
    const sizeMap: Record<string, string> = {
      '800': '1 – 5 kW',
      '1200': '6 – 10 kW',
      '1600': '11 – 15 kW',
      '2000': '16 – 20 kW',
      '2500': '21 – 25 kW',
      '3000': '26 – 30 kW',
      'contact': '31 kW & Above (Custom Quote Required)'
    };
    const packageMap: Record<string, string> = {
      '1': 'Basic (Annual Checkup)',
      '1.2': 'Moderate (Bi-Annual Checkup)',
      '1.4': 'Comprehensive (Quarterly Checkup)'
    };
    const hoursMap: Record<string, string> = {
      '1': 'Grid Tied',
      '1.2': 'Hybrid'
    };
    const planMap: Record<string, string> = {
      '0': 'Monthly',
      '0.07': 'Quarterly Advance (7% off)',
      '0.15': 'Bi-Annual Advance (15% off)',
      '0.3': 'Annual Advance (30% off)'
    };

    const displaySize = sizeMap[rawData.systemSize] || (rawData.systemSize ? `${rawData.systemSize} kW` : 'Custom');
    const displayPackage = packageMap[rawData.package] || rawData.package;
    const displayType = hoursMap[rawData.monitoringHours] || rawData.monitoringHours;
    const displayPlan = planMap[rawData.paymentPlan] || rawData.paymentPlan;

    // Send email notification to energygurusonline@gmail.com
    const htmlMessage = `
        <h2 style="color: #12213A; margin-top: 0; font-size: 18px; border-bottom: 2px solid #E8A33D; padding-bottom: 8px;">
          ⚡ New Solar Monitoring Setup Inquiry
        </h2>
        <p style="font-size: 14px; color: #4A5568;">
          A customer has submitted a new monitoring package inquiry on EnergyGurus:
        </p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
          <tr style="background: #F7FAFC;">
            <td style="padding: 10px; font-weight: bold; width: 35%; border: 1px solid #E2E8F0;">Customer Name</td>
            <td style="padding: 10px; border: 1px solid #E2E8F0;">${rawData.customerName} (${rawData.customerType || 'N/A'})</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #E2E8F0;">Email</td>
            <td style="padding: 10px; border: 1px solid #E2E8F0;"><a href="mailto:${rawData.email}" style="color: #2F6E62;">${rawData.email}</a></td>
          </tr>
          <tr style="background: #F7FAFC;">
            <td style="padding: 10px; font-weight: bold; border: 1px solid #E2E8F0;">Contact / Phone</td>
            <td style="padding: 10px; border: 1px solid #E2E8F0;"><a href="tel:${rawData.contactNo}" style="color: #2F6E62; font-weight: bold;">${rawData.contactNo}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #E2E8F0;">CNIC Number</td>
            <td style="padding: 10px; border: 1px solid #E2E8F0;">${rawData.cnic || 'N/A'}</td>
          </tr>
          <tr style="background: #F7FAFC;">
            <td style="padding: 10px; font-weight: bold; border: 1px solid #E2E8F0;">Site Address</td>
            <td style="padding: 10px; border: 1px solid #E2E8F0;">${rawData.address}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #E2E8F0;">System Size</td>
            <td style="padding: 10px; font-weight: bold; color: #2F6E62; border: 1px solid #E2E8F0;">${displaySize}</td>
          </tr>
          <tr style="background: #F7FAFC;">
            <td style="padding: 10px; font-weight: bold; border: 1px solid #E2E8F0;">Package</td>
            <td style="padding: 10px; border: 1px solid #E2E8F0;">${displayPackage}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #E2E8F0;">System Type</td>
            <td style="padding: 10px; border: 1px solid #E2E8F0;">${displayType}</td>
          </tr>
          <tr style="background: #F7FAFC;">
            <td style="padding: 10px; font-weight: bold; border: 1px solid #E2E8F0;">Payment Plan</td>
            <td style="padding: 10px; border: 1px solid #E2E8F0;">${displayPlan}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #E2E8F0;">Amount Payable</td>
            <td style="padding: 10px; font-weight: bold; color: #B4690E; border: 1px solid #E2E8F0;">${rawData.amountPayable || 'N/A'}</td>
          </tr>
        </table>
        <div style="margin-top: 25px; text-align: center;">
          <a href="https://energygurus.online/dashboard/inbox" style="display: inline-block; background-color: #E8A33D; color: #12213A; font-weight: bold; text-decoration: none; padding: 12px 22px; border-radius: 6px; margin-right: 10px; font-size: 13px;">
            Open in Support Inbox
          </a>
          <a href="mailto:${rawData.email}?subject=Regarding%20Your%20EnergyGurus%20Monitoring%20Request" style="display: inline-block; background-color: #12213A; color: #FFFFFF; font-weight: bold; text-decoration: none; padding: 12px 22px; border-radius: 6px; font-size: 13px;">
            Reply to Customer
          </a>
        </div>
    `;

    try {
      await sendAdminNotificationEmail(
        `Monitoring Inquiry: ${rawData.customerName} (${displaySize})`, 
        htmlMessage,
        { email: rawData.email, name: rawData.customerName }
      );
    } catch (mailErr) {
      console.error('Failed to send email notification to energygurusonline@gmail.com:', mailErr);
    }

    revalidatePath("/dashboard/inbox", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/monitoring/requests");

    return { success: true };
  } catch (error) {
    console.error('Error submitting monitoring request:', error);
    return { success: false, error: 'Failed to submit request' };
  }
}
