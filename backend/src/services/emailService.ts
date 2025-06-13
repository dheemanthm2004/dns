import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for others
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter connection once during setup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service connection failed:', error);
  } else {
    console.log('✅ Email service connected successfully');
  }
});

export async function sendEmail(to: string, message: string, subject?: string) {
  try {
    const info = await transporter.sendMail({
      from: `"DheeNotifications" <${process.env.SMTP_USER}>`,
      to,
      subject: subject || 'Notification',
      text: message,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🔔 DheeNotifications</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; line-height: 1.6; color: #333;">${message}</p>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Powered by DheeNotifications Enterprise Platform</p>
        </div>
      </div>`,
    });

    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err);
    throw err;
  }
}