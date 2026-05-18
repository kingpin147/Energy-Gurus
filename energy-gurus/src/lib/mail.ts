export async function sendInvitationEmail(toEmail: string, role: string) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("BREVO_API_KEY is not defined. Skipping invitation email sending.");
    return false;
  }

  const roleLabels: Record<string, string> = {
    admin: "Administrator",
    epc: "EPC Installer",
    brand: "Solar Brand"
  };

  const roleLabel = roleLabels[role] || role;
  const signUpUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/sign-up?email=${encodeURIComponent(toEmail)}`;

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: {
          name: "Energy Gurus",
          email: "info@energygurus.com" // Brevo account authorized sender
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
                background: linear-gradient(135deg, #10b981, #059669);
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
                background: #ecfdf5;
                color: #047857;
                padding: 6px 16px;
                border-radius: 9999px;
                font-size: 11px;
                font-weight: 850;
                text-transform: uppercase;
                letter-spacing: 1.2px;
                margin-bottom: 25px;
                border: 1px solid #d1fae5;
              }
              .btn-container {
                text-align: center;
                margin: 35px 0;
              }
              .btn {
                display: inline-block;
                background: #10b981;
                color: #ffffff !important;
                text-decoration: none;
                padding: 18px 40px;
                border-radius: 16px;
                font-weight: 800;
                font-size: 16px;
                box-shadow: 0 10px 20px rgba(16, 185, 129, 0.15);
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
                  <a href="${signUpUrl}" style="color: #10b981; word-break: break-all;">${signUpUrl}</a>
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
      return true;
    } else {
      const errorText = await response.text();
      console.error("Brevo API error payload:", errorText);
      return false;
    }
  } catch (error) {
    console.error("Brevo POST execution failed:", error);
    return false;
  }
}
