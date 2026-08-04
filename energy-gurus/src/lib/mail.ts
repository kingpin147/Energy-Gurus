const RETRYABLE_STATUS_CODES = [429, 502, 503, 504];
const RETRY_DELAY_MS = 1000;

async function fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
  const response = await fetch(url, options);
  if (!response.ok && RETRYABLE_STATUS_CODES.includes(response.status)) {
    console.warn(`Brevo API returned ${response.status}, retrying in ${RETRY_DELAY_MS}ms...`);
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    return fetch(url, options);
  }
  return response;
}

export async function sendInvitationEmail(toEmail: string, role: string): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured. Cannot send invitation emails.");
  }

  const roleLabels: Record<string, string> = {
    admin: "Administrator",
    epc: "EPC Installer",
    brand: "Solar Brand"
  };

  const roleLabel = roleLabels[role] || role;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    console.warn("NEXT_PUBLIC_APP_URL is not set — email links will use localhost fallback.");
  }
  const signUpUrl = `${appUrl || "http://localhost:3000"}/sign-up?email=${encodeURIComponent(toEmail)}`;

  try {
    const response = await fetchWithRetry("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: {
          name: "Energy Gurus",
          email: "energygurusonline@gmail.com"
        },
        to: [
          {
            email: toEmail
          }
        ],
        subject: "⚡ Exclusive Invitation to Join Energy Gurus",
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Energy Gurus Invitation</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                background-color: #f9fafb;
                margin: 0;
                padding: 40px 10px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 24px;
                overflow: hidden;
                box-shadow: 0 8px 30px rgba(0,0,0,0.03);
                border: 1px solid #f1f5f9;
              }
              .header {
                background: linear-gradient(135deg, #006d6d, #005353);
                padding: 50px 30px;
                text-align: center;
                color: #ffffff;
              }
              .logo {
                font-size: 30px;
                font-weight: 900;
                letter-spacing: -1.5px;
                margin: 0;
                text-transform: uppercase;
              }
              .content {
                padding: 40px 35px;
                color: #334155;
                line-height: 1.7;
              }
              .title {
                font-size: 24px;
                font-weight: 800;
                margin-top: 0;
                margin-bottom: 20px;
                color: #0f172a;
                letter-spacing: -0.5px;
              }
              .badge {
                display: inline-block;
                background: #e6f5f5;
                color: #006d6d;
                padding: 6px 16px;
                border-radius: 9999px;
                font-size: 11px;
                font-weight: 850;
                text-transform: uppercase;
                letter-spacing: 1.2px;
                margin-bottom: 25px;
                border: 1px solid #b8e8e8;
              }
              .btn-container {
                text-align: center;
                margin: 35px 0;
              }
              .btn {
                display: inline-block;
                background: #006d6d;
                color: #ffffff !important;
                text-decoration: none;
                padding: 18px 40px;
                border-radius: 16px;
                font-weight: 800;
                font-size: 16px;
                box-shadow: 0 10px 20px rgba(0, 109, 109, 0.15);
                transition: transform 0.2s ease;
              }
              .footer {
                padding: 35px;
                text-align: center;
                font-size: 12px;
                color: #94a3b8;
                background-color: #f8fafc;
                border-top: 1px solid #f1f5f9;
                line-height: 1.5;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 class="logo">⚡ ENERGY GURUS</h1>
              </div>
              <div class="content">
                <div class="badge">${roleLabel} Partner</div>
                <h2 class="title">Exclusive Platform Access</h2>
                <p>Hello,</p>
                <p>You have been formally invited to join the <strong>Energy Gurus</strong> solar ecosystem as a verified <strong>${roleLabel}</strong> partner.</p>
                <p>Energy Gurus operates strictly on an <strong>invite-only basis</strong> to guarantee high trust. By claiming this invitation, your business profile will be automatically verified and indexed immediately into our public directory, enabling solar search clients to contact you directly.</p>
                
                <div class="btn-container">
                  <a href="${signUpUrl}" class="btn">Claim Listing & Register</a>
                </div>
                
                <p style="margin-top: 30px; font-size: 13px; color: #64748b;">
                  If the button doesn't work, copy and paste this link in your browser:<br>
                  <a href="${signUpUrl}" style="color: #006d6d; word-break: break-all;">${signUpUrl}</a>
                </p>
              </div>
              <div class="footer">
                &copy; ${new Date().getFullYear()} Energy Gurus. All rights reserved.<br>
                This is a secure transactional email intended strictly for the invited business. Please do not forward.
              </div>
            </div>
          </body>
          </html>
        `
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Invitation email sent to ${toEmail} (messageId: ${result.messageId})`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ Brevo API error [${response.status}] for ${toEmail}:`, errorText);
      throw new Error(`Email delivery failed: Brevo returned ${response.status}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Email delivery failed")) {
      throw error;
    }
    console.error("❌ Brevo POST execution failed:", error);
    throw new Error("Failed to connect to email service. Please try again.");
  }
}

export async function sendAdminNotificationEmail(subject: string, messageHtml: string): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("BREVO_API_KEY is not configured. Cannot send admin notification emails.");
    return false;
  }

  try {
    const response = await fetchWithRetry("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: {
          name: "Energy Gurus System",
          email: "energygurusonline@gmail.com"
        },
        to: [
          {
            email: "energygurusonline@gmail.com" // Sending to the admin email
          }
        ],
        subject: `[Admin Alert] ${subject}`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #006d6d; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #eee; border-top: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">⚡ Energy Gurus Notification</h2>
              </div>
              <div class="content">
                ${messageHtml}
              </div>
            </div>
          </body>
          </html>
        `
      })
    });

    if (response.ok) {
      console.log(`✅ Admin notification email sent: ${subject}`);
      return true;
    } else {
      console.error(`❌ Brevo API error for admin notification:`, await response.text());
      return false;
    }
  } catch (error) {
    console.error("❌ Failed to send admin notification email:", error);
    return false;
  }
}

