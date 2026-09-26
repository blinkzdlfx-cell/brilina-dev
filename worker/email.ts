import type { Env } from './types';

const RESEND_API_URL = 'https://api.resend.com/emails';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  env: Env;
}

async function sendEmail({ to, subject, html, env }: EmailParams): Promise<boolean> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('Resend API key is not configured');
    return false;
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Brilina Dev <noreply@brilina.dev>',
        to: [to],
        subject,
        html
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  env: Env
): Promise<boolean> {
  const resetUrl = `https://brilina.dev/auth/reset-password?token=${resetToken}`;
  const subject = 'Reset your Brilina Dev password';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset your password</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h1 style="color: #111;">Reset your password</h1>
      <p>You requested a password reset for your Brilina Dev account.</p>
      <p>Click the link below to reset your password:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #111; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">
        This link will expire in 1 hour. If you didn't request this, please ignore this email.
      </p>
      <p style="color: #666; font-size: 14px;">
        If the button doesn't work, copy and paste this URL into your browser:<br>
        <span style="word-break: break-all;">${resetUrl}</span>
      </p>
    </body>
    </html>
  `;

  return sendEmail({ to, subject, html, env });
}

export async function sendWelcomeEmail(to: string, env: Env): Promise<boolean> {
  const subject = 'Welcome to Brilina Dev';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h1 style="color: #111;">Welcome to Brilina Dev</h1>
      <p>Your admin account has been created successfully.</p>
      <p>You can now log in and manage your portfolio content.</p>
    </body>
    </html>
  `;

  return sendEmail({ to, subject, html, env });
}
