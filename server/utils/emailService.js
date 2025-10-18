import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for Gmail SMTP
const createGmailTransporter = () => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'malwatkarpranav@gmail.com',
      pass: process.env.EMAIL_PASS || 'owlz lxut hlip tjcs'
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  return transporter;
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, resetLink) => {
  try {
    // Always use Gmail SMTP for now
    const transporter = createGmailTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || 'malwatkarpranav@gmail.com',
      to: email,
      subject: 'Password Reset Request - Careervue',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Careervue</h1>
            <p style="color: white; margin: 10px 0 0 0;">Password Reset Request</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You recently requested to reset your password for your Careervue account. 
              Click the button below to reset it.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you didn't request this password reset, please ignore this email or contact support if you have concerns.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This password reset link will expire in 1 hour.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              If the button above doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetLink}" style="color: #667eea;">${resetLink}</a>
            </p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © 2024 Careervue. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        Password Reset Request - Careervue
        
        Hello!
        
        You recently requested to reset your password for your Careervue account. 
        Click the link below to reset it:
        
        ${resetLink}
        
        If you didn't request this password reset, please ignore this email or contact support if you have concerns.
        
        This password reset link will expire in 1 hour.
        
        Best regards,
        The Careervue Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Password reset email sent successfully!');
    console.log('Message ID:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId
    };
    
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send password reset email');
  }
}; 