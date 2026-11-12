'use server';

import { db } from '@/db';
import { monitoringRequests, inquiries, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { sendAdminNotificationEmail } from '@/lib/mail';

export async function submitMonitoringRequest(formData: FormData) {
  try {
    const customerName = ((formData.get('customerName') || formData.get('name')) as string)?.trim();
    const designation = (formData.get('designation') as string)?.trim() || null;
    const company = (formData.get('company') as string)?.trim() || null;
    const city = (formData.get('city') as string)?.trim() || null;
    const contactNo = (formData.get('contactNo') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();
    const remarks = (formData.get('remarks') as string)?.trim() || null;
    
    // Optional legacy fields (if ever passed)
    const address = (formData.get('address') as string)?.trim() || city || null;
    const cnic = (formData.get('cnic') as string)?.trim() || null;
    const customerType = (formData.get('customerType') as string)?.trim() || null;
    const systemSize = (formData.get('systemSize') as string)?.trim() || null;
    const pkg = (formData.get('package') as string)?.trim() || null;
    const monitoringHours = (formData.get('monitoringHours') as string)?.trim() || null;
    const paymentPlan = (formData.get('paymentPlan') as string)?.trim() || null;
    const amountPayable = (formData.get('amountPayable') as string)?.trim() || null;

    // Basic validation
    if (!customerName || !email || !contactNo) {
      return { success: false, error: 'Please provide your name, contact number, and email.' };
    }

    const rawData = {
      customerName,
      designation,
      company,
      city,
      address,
      contactNo,
      email,
      cnic,
      customerType,
      systemSize,
      package: pkg,
      monitoringHours,
      paymentPlan,
      amountPayable,
      remarks,
    };

    // Insert into database
    await db.insert(monitoringRequests).values(rawData);

    // Sync into inquiries table so it appears in Admin Support Inbox and Dashboard Overview
    try {
      const [admin] = await db.select().from(users).where(eq(users.role, "super-admin")).limit(1);
      const [fallbackAdmin] = !admin ? await db.select().from(users).where(eq(users.role, "admin")).limit(1) : [null];
      const targetAdmin = admin ?? fallbackAdmin;
      if (targetAdmin) {
        const messageLines = [
          `New Monitoring & Contact Request:`,
          `• Name: ${customerName}`,
          designation ? `• Designation: ${designation}` : null,
          company ? `• Company: ${company}` : null,
          city ? `• City: ${city}` : null,
          `• Contact No: ${contactNo}`,
          `• Email: ${email}`,
          remarks ? `• Remarks: ${remarks}` : null,
          systemSize ? `• System Size: ${systemSize}` : null,
          pkg ? `• Package: ${pkg}` : null,
        ].filter(Boolean).join('\n');

        await db.insert(inquiries).values({
          receiverId: targetAdmin.id,
          guestName: customerName,
          guestEmail: email,
          guestPhone: contactNo,
          subject: `Contact Request - ${customerName}${company ? ` (${company})` : ''}`,
          message: messageLines,
          inquiryType: "public",
          status: "new",
          isRead: false,
          metadata: rawData,
        });
      }
    } catch (inqErr) {
      console.error('Error syncing monitoring request to inquiries table:', inqErr);
    }

    // Send email notification to energygurusonline@gmail.com
    const htmlMessage = `
        <h2 style="color: #12213A; margin-top: 0; font-size: 18px; border-bottom: 2px solid #E8A33D; padding-bottom: 8px;">
          ⚡ New Request to Contact - Monitoring
        </h2>
        <p style="font-size: 14px; color: #4A5568;">
          A customer has submitted a new contact inquiry through the EnergyGurus Monitoring page:
        </p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
          <tr style="background: #F7FAFC;">
            <td style="padding: 10px; font-weight: bold; width: 35%; border: 1px solid #E2E8F0;">Name</td>
            <td style="padding: 10px; border: 1px solid #E2E8F0;">${customerName}</td>
          </tr>
          ${designation ? `<tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #E2E8F0;">Designation</td>
            <td style="padding: 10px; border: 1px solid #E2E8F0;">${designation}</td>
          </tr>` : ''}
          ${company ? `<tr style="background: #F7FAFC;">
            <td style="padding: 10px; font-weight: bold; border: 1px solid #E2E8F0;">Company</td>
            <td style="padding: 10px; border: 1px solid #E2E8F0;">${company}</td>
          </tr>` : ''}
          ${city ? `<tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #E2E8F0;">City</td>
            <td style="padding: 10px; border: 1px solid #E2E8F0;">${city}</td>
          </tr>` : ''}
          <tr style="background: #F7FAFC;">
            <td style="padding: 10px; font-weight: bold; border: 1px solid #E2E8F0;">Contact / Phone</td>
            <td style="padding: 10px; border: 1px solid #E2E8F0;"><a href="tel:${contactNo}" style="color: #2F6E62; font-weight: bold;">${contactNo}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #E2E8F0;">Email</td>
            <td style="padding: 10px; border: 1px solid #E2E8F0;"><a href="mailto:${email}" style="color: #2F6E62;">${email}</a></td>
          </tr>
          ${remarks ? `<tr style="background: #F7FAFC;">
            <td style="padding: 10px; font-weight: bold; border: 1px solid #E2E8F0;">Remarks</td>
            <td style="padding: 10px; border: 1px solid #E2E8F0; white-space: pre-line;">${remarks}</td>
          </tr>` : ''}
        </table>
        <div style="margin-top: 25px; text-align: center;">
          <a href="https://energygurus.online/dashboard/inbox" style="display: inline-block; background-color: #E8A33D; color: #12213A; font-weight: bold; text-decoration: none; padding: 12px 22px; border-radius: 6px; margin-right: 10px; font-size: 13px;">
            Open in Support Inbox
          </a>
          <a href="mailto:${email}?subject=Regarding%20Your%20EnergyGurus%20Monitoring%20Request" style="display: inline-block; background-color: #12213A; color: #FFFFFF; font-weight: bold; text-decoration: none; padding: 12px 22px; border-radius: 6px; font-size: 13px;">
            Reply to Customer
          </a>
        </div>
    `;

    try {
      await sendAdminNotificationEmail(
        `Monitoring Inquiry: ${customerName}${company ? ` (${company})` : ''}`, 
        htmlMessage,
        { email, name: customerName }
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
