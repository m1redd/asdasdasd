import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {


    console.log('SMTP User:burkatsiy.olexandr@gmail.com');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "burkatsiy.olexandr@gmail.com",
        pass: "mxjl aryv fwuf otjl"
      },
    });
    await transporter.verify();
    console.log('SMTP connection verified');
    const mailOptions = {
      from: "burkatsiy.olexandr@gmail.com",
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to);
    console.log('Message ID:', result.messageId);
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export function generatePasswordEmail(name: string, password: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; }
        .content { background: white; padding: 30px; border-radius: 5px; }
        .password { 
          background: #fff3cd; 
          padding: 15px; 
          border-radius: 5px; 
          font-size: 18px; 
          font-weight: bold; 
          text-align: center;
          margin: 20px 0;
        }
        .warning { color: #856404; background: #fff3cd; padding: 10px; border-radius: 3px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Congrats</h1>
        </div>
        <div class="content">
          <p>${name},</p>
          <p>Here's ur pass:</p>
          
          <div class="password">
            <strong>${password}</strong>
          </div>
          
          <div class="warning">
            Save it somewhere safe! This password is shown only once.
          </div>

          <p>Best regards,<br>Advin global</p>
        </div>
      </div>
    </body>
    </html>
  `;
}