import dotenv from 'dotenv';
dotenv.config();

import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendSMS(to: string, message: string) {
  try {
    const result = await client.messages.create({
      body: `🔔 DheeNotifications: ${message}`,
      from: process.env.TWILIO_PHONE,
      to, // Must be a verified number in trial mode
    });

    console.log(`📱 SMS sent to ${to}: ${result.sid}`);
    return { success: true, messageId: result.sid };
  } catch (err) {
    console.error(`❌ Failed to send SMS to ${to}:`, err);
    throw err;
  }
}