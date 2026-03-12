import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

// Create transporter
const createTransporter = () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
      }
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD
    }
  });
};

// Send email notification
export const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!EMAIL_USER || !EMAIL_PASSWORD) {
      console.warn('Email credentials not configured. Skipping email notification.');
      return { success: false, message: 'Email not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `GenAI Placement System <${EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
export const emailTemplates = {
  // Job Posted Notification
  jobPosted: (jobData, recipients) => ({
    subject: `New Job Posted: ${jobData.position} at ${jobData.company}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎯 New Job Opportunity!</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #667eea; margin-top: 0;">${jobData.position}</h2>
          <p style="font-size: 18px; color: #333;"><strong>${jobData.company}</strong></p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${jobData.location}</p>
            <p style="margin: 5px 0;"><strong>💰 Salary:</strong> ${jobData.salary || 'Not specified'}</p>
            <p style="margin: 5px 0;"><strong>⏱️ Job Type:</strong> ${jobData.jobType || 'Full-time'}</p>
          </div>
          
          ${jobData.description ? `
            <div style="margin: 20px 0;">
              <h3 style="color: #333;">Job Description:</h3>
              <p style="color: #666; line-height: 1.6;">${jobData.description.substring(0, 200)}...</p>
            </div>
          ` : ''}
          
          ${jobData.skills ? `
            <div style="margin: 20px 0;">
              <h3 style="color: #333;">Required Skills:</h3>
              <p style="color: #666;">${Array.isArray(jobData.skills) ? jobData.skills.join(', ') : jobData.skills}</p>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:5173/login" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              Apply Now
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e9ecef; text-align: center; color: #999; font-size: 12px;">
            <p>This is an automated notification from GenAI Placement System</p>
            <p>© 2026 GenAI Placement System. All rights reserved.</p>
          </div>
        </div>
      </div>
    `
  }),

  // Application Submitted Notification (to HR/Staff)
  applicationSubmitted: (applicationData) => ({
    subject: `New Application: ${applicationData.studentName} applied for ${applicationData.jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📋 New Application Received!</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #11998e; margin-top: 0;">Application Details</h2>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>👤 Student:</strong> ${applicationData.studentName}</p>
            <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${applicationData.studentEmail}</p>
            <p style="margin: 5px 0;"><strong>💼 Position:</strong> ${applicationData.jobTitle}</p>
            <p style="margin: 5px 0;"><strong>🏢 Company:</strong> ${applicationData.company}</p>
            <p style="margin: 5px 0;"><strong>📅 Applied:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://gen-ai-placement-management-system.vercel.app/login"
               style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(17, 153, 142, 0.4);">
              View Application
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e9ecef; text-align: center; color: #999; font-size: 12px;">
            <p>This is an automated notification from GenAI Placement System</p>
          </div>
        </div>
      </div>
    `
  }),

  // Application Status Update (to Student)
  applicationStatusUpdate: (applicationData) => ({
    subject: `Application Update: ${applicationData.jobTitle} - ${applicationData.status}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔔 Application Status Update</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #f5576c; margin-top: 0;">Your Application Status Changed</h2>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>💼 Position:</strong> ${applicationData.jobTitle}</p>
            <p style="margin: 5px 0;"><strong>🏢 Company:</strong> ${applicationData.company}</p>
            <p style="margin: 5px 0;"><strong>📊 New Status:</strong> <span style="color: #f5576c; font-weight: bold; text-transform: uppercase;">${applicationData.status}</span></p>
          </div>
          
          ${applicationData.feedback ? `
            <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
              <h3 style="color: #856404; margin-top: 0;">Feedback:</h3>
              <p style="color: #856404; margin-bottom: 0;">${applicationData.feedback}</p>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:5173/login" 
               style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);">
              View Details
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e9ecef; text-align: center; color: #999; font-size: 12px;">
            <p>This is an automated notification from GenAI Placement System</p>
          </div>
        </div>
      </div>
    `
  }),

  // Job Requisition Created (to Admin)
  jobRequisitionCreated: (requisitionData) => ({
    subject: `New Job Requisition: ${requisitionData.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📝 New Job Requisition</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #fa709a; margin-top: 0;">${requisitionData.title}</h2>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>🏢 Department:</strong> ${requisitionData.department}</p>
            <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${requisitionData.location}</p>
            <p style="margin: 5px 0;"><strong>👥 Positions:</strong> ${requisitionData.numberOfPositions || 1}</p>
            <p style="margin: 5px 0;"><strong>⚡ Priority:</strong> ${requisitionData.priority || 'Medium'}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:5173/login" 
               style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(250, 112, 154, 0.4);">
              Review Requisition
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e9ecef; text-align: center; color: #999; font-size: 12px;">
            <p>This is an automated notification from GenAI Placement System</p>
          </div>
        </div>
      </div>
    `
  })
};

// Notification functions for different scenarios
export const notifyNewJob = async (jobData, userEmails) => {
  const template = emailTemplates.jobPosted(jobData);
  const results = [];
  
  for (const email of userEmails) {
    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html
    });
    results.push({ email, ...result });
  }
  
  return results;
};

export const notifyNewApplication = async (applicationData, hrEmails) => {
  const template = emailTemplates.applicationSubmitted(applicationData);
  const results = [];
  
  for (const email of hrEmails) {
    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html
    });
    results.push({ email, ...result });
  }
  
  return results;
};

export const notifyApplicationStatus = async (applicationData, studentEmail) => {
  const template = emailTemplates.applicationStatusUpdate(applicationData);
  return await sendEmail({
    to: studentEmail,
    subject: template.subject,
    html: template.html
  });
};

export const notifyJobRequisition = async (requisitionData, adminEmails) => {
  const template = emailTemplates.jobRequisitionCreated(requisitionData);
  const results = [];
  
  for (const email of adminEmails) {
    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html
    });
    results.push({ email, ...result });
  }
  
  return results;
};

export default {
  sendEmail,
  emailTemplates,
  notifyNewJob,
  notifyNewApplication,
  notifyApplicationStatus,
  notifyJobRequisition
};
