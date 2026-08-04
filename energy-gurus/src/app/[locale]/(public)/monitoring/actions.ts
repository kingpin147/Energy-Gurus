'use server';

import { db } from '@/db';
import { monitoringRequests } from '@/db/schema';
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
      amountPayable: formData.get('amountPayable') as string,
    };

    // Basic validation
    if (!rawData.customerName || !rawData.email || !rawData.contactNo) {
      return { success: false, error: 'Missing required fields' };
    }

    // Insert into database
    await db.insert(monitoringRequests).values(rawData);

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
        <p><a href="https://energygurus.net/dashboard/monitoring/requests">View all requests in Dashboard</a></p>
    `;
    
    sendAdminNotificationEmail("New Monitoring Request Received", htmlMessage).catch(console.error);

    return { success: true };
  } catch (error) {
    console.error('Error submitting monitoring request:', error);
    return { success: false, error: 'Failed to submit request' };
  }
}
