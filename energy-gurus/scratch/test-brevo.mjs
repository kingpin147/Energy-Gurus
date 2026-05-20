import fs from 'fs';
import path from 'path';

// Read .env file manually
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
let apiKey = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('BREVO_API_KEY=')) {
    apiKey = line.split('=')[1].trim();
  }
}

if (!apiKey) {
  console.error("No BREVO_API_KEY found in .env");
  process.exit(1);
}

console.log("Testing Brevo API key:", apiKey.substring(0, 10) + "...");

async function testEmail() {
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
          email: "info@energygurus.com"
        },
        to: [
          {
            email: "nomiking0072012@gmail.com"
          }
        ],
        subject: "Test from API",
        htmlContent: "<p>This is a test.</p>"
      })
    });

    if (response.ok) {
      console.log("SUCCESS! Email sent.");
    } else {
      const errorText = await response.text();
      console.error("FAILED! Brevo API error payload:", errorText);
    }
  } catch (error) {
    console.error("Execution failed:", error);
  }
}

testEmail();
