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
    admin: "Platform Administrator",
    epc: "EPC Installer",
    brand: "Solar Brand"
  };

  const roleDescriptions: Record<string, string> = {
    epc: "You have been formally invited to join the <strong>EnergyGurus</strong> ecosystem as a verified <strong>EPC Installer</strong> partner. By claiming this invitation, your business profile will be automatically verified and indexed into our public directory, enabling clients and homeowners to connect with you directly.",
    brand: "You have been formally invited to join the <strong>EnergyGurus</strong> ecosystem as an official <strong>Solar Brand</strong> partner. By claiming this invitation, your equipment portfolio will be verified and indexed in our brand directory to connect with certified installers and consumers.",
    admin: "You have been granted administrative privileges on the <strong>EnergyGurus</strong> platform to oversee analytics, moderation, and verified business onboarding."
  };

  const badgeStyles: Record<string, { bg: string; color: string; border: string }> = {
    epc: { bg: "#EBF5F3", color: "#2F6E62", border: "#BFE3DC" },
    brand: { bg: "#FEF7EC", color: "#B4690E", border: "#FCD34D" },
    admin: { bg: "#EEF2FF", color: "#3730A3", border: "#C7D2FE" }
  };

  const roleLabel = roleLabels[role] || role;
  const description = roleDescriptions[role] || `You have been formally invited to join the <strong>EnergyGurus</strong> platform as a <strong>${roleLabel}</strong> partner.`;
  const badge = badgeStyles[role] || { bg: "#F5F6F3", color: "#12213A", border: "#E2E8F0" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.energygurus.online";
  const signUpUrl = `${appUrl}/sign-up?email=${encodeURIComponent(toEmail)}`;

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
          name: "EnergyGurus",
          email: "energygurusonline@gmail.com"
        },
        to: [
          {
            email: toEmail
          }
        ],
        subject: `⚡ Invitation to Join EnergyGurus as a Verified ${roleLabel}`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>EnergyGurus Partner Invitation</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F5F6F3; margin: 0; padding: 40px 15px; color: #1B1F24;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 36px rgba(18, 33, 58, 0.08); border: 1px solid rgba(18, 33, 58, 0.08);">
              
              <!-- Header with Dark Ink Navy & Amber Gold Accent -->
              <div style="background-color: #12213A; padding: 36px 30px; text-align: center; border-bottom: 4px solid #E8A33D;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                  <tr>
                    <td style="vertical-align: middle; padding-right: 12px;">
                      <img src="https://www.energygurus.online/logo-icon.svg" width="40" height="40" alt="EnergyGurus" style="display: block; border: 0;" />
                    </td>
                    <td style="vertical-align: middle;">
                      <span style="font-size: 24px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px; text-transform: uppercase;">ENERGY <span style="color: #E8A33D;">GURUS</span></span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Content Body -->
              <div style="padding: 40px 35px;">
                <div style="margin-bottom: 20px;">
                  <span style="display: inline-block; background-color: ${badge.bg}; color: ${badge.color}; padding: 6px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; border: 1px solid ${badge.border};">
                    ${roleLabel} Partner
                  </span>
                </div>

                <h2 style="font-size: 24px; font-weight: 800; margin: 0 0 16px 0; color: #12213A; letter-spacing: -0.5px;">
                  Exclusive Platform Invitation
                </h2>

                <p style="font-size: 15px; color: #4A5A73; line-height: 1.7; margin: 0 0 16px 0;">Hello,</p>

                <p style="font-size: 15px; color: #4A5A73; line-height: 1.7; margin: 0 0 24px 0;">
                  ${description}
                </p>
                
                <div style="background-color: #F8FAFC; border-left: 4px solid #E8A33D; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 32px;">
                  <p style="font-size: 13px; color: #12213A; font-weight: 600; margin: 0; line-height: 1.5;">
                    🔒 <strong>Invite-Only Network:</strong> EnergyGurus maintains strict verification standards. Claiming this invitation instantly grants your business verified partner status.
                  </p>
                </div>

                <div style="text-align: center; margin: 35px 0 30px 0;">
                  <a href="${signUpUrl}" style="display: inline-block; background-color: #E8A33D; color: #12213A !important; text-decoration: none; padding: 16px 38px; border-radius: 12px; font-weight: 800; font-size: 16px; box-shadow: 0 8px 24px rgba(232, 163, 61, 0.35); text-transform: none;">
                    Claim Listing & Register →
                  </a>
                </div>

                <p style="font-size: 13px; color: #64748B; line-height: 1.6; margin: 30px 0 0 0; border-top: 1px dashed #E2E8F0; padding-top: 20px;">
                  If the button doesn't work, copy and paste this link in your browser:<br>
                  <a href="${signUpUrl}" style="color: #2F6E62; word-break: break-all; text-decoration: underline;">${signUpUrl}</a>
                </p>
              </div>

              <!-- Footer -->
              <div style="padding: 24px 35px; text-align: center; font-size: 12px; color: #94A3B8; background-color: #F8FAFC; border-top: 1px solid #F1F5F9; line-height: 1.6;">
                &copy; ${new Date().getFullYear()} EnergyGurus. All rights reserved.<br>
                This is a secure transactional email intended strictly for the invited partner. Please do not forward.
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
          name: "EnergyGurus System",
          email: "energygurusonline@gmail.com"
        },
        to: [
          {
            email: "energygurusonline@gmail.com"
          }
        ],
        subject: `[Admin Alert] ${subject}`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: sans-serif; line-height: 1.6; color: #1B1F24; background-color: #F5F6F3; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; }
              .header { background: #12213A; color: white; padding: 20px; border-bottom: 3px solid #E8A33D; text-align: center; }
              .content { padding: 25px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0; font-size: 20px;">⚡ ENERGY <span style="color: #E8A33D;">GURUS</span></h2>
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

