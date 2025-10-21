const nodemailer = require('nodemailer');

// Create reusable transporter object using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'ashritha.g2004@gmail.com',
      pass: process.env.EMAIL_PASS || 'ndzqznfzmdqyxxul' // Use app password
    }
  });
};

// Send petition confirmation email to user
const sendPetitionConfirmationEmail = async (emailData) => {
  const { to, userName, petitionTitle, petitionId, category, location } = emailData;
  let transporter;
  try {
    transporter = createTransporter();
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    throw error;
  }
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'ashritha.g2004@gmail.com',
    to: to,
    subject: 'Petition Submitted Successfully - Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin: 0;">Petition Submission Confirmed</h2>
        </div>
        
        <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
          <p>Dear ${userName},</p>
          
          <p>Thank you for submitting your petition. We have received your complaint and it is now under review.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Petition Details:</h3>
            <p><strong>Title:</strong> ${petitionTitle}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Petition ID:</strong> ${petitionId}</p>
            <p><strong>Status:</strong> Received</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>Your petition will be reviewed by our team and you will be notified of any status updates.</p>
          
          <p>If you have any questions or need to make changes to your petition, please contact our support team.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; font-size: 14px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
      Petition Submission Confirmed
      
      Dear ${userName},
      
      Thank you for submitting your petition. We have received your complaint and it is now under review.
      
      Petition Details:
      - Title: ${petitionTitle}
      - Category: ${category}
      - Location: ${location}
      - Petition ID: ${petitionId}
      - Status: Active
      - Submitted: ${new Date().toLocaleString()}
      
      Your petition will be reviewed by our team and you will be notified of any status updates.
      
      If you have any questions or need to make changes to your petition, please contact our support team.
      
      This is an automated message. Please do not reply to this email.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Petition confirmation email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending petition confirmation email:', error);
    throw error;
  }
};

// Send status update email to petition creator
const sendStatusUpdateEmail = async (emailData) => {
  const { to, userName, petitionTitle, newStatus, petitionId } = emailData;
  let transporter;
  try {
    transporter = createTransporter();
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    throw error;
  }
  
  const statusMessages = {
    'received': 'We have received your petition and logged it successfully.',
    'in_review': 'Your petition is currently under review by our team.',
    'resolved': 'Your petition has been resolved. Thank you for your patience.'
  };
  
  const statusColors = {
    'received': '#17a2b8',
    'in_review': '#ffc107',
    'resolved': '#28a745'
  };
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'ashritha.g2004@gmail.com',
    to: to,
    subject: `Petition Status Update - ${petitionTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin: 0;">Petition Status Update</h2>
        </div>
        
        <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
          <p>Dear ${userName},</p>
          
          <p>We have an update regarding your petition submission.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Petition Details:</h3>
            <p><strong>Title:</strong> ${petitionTitle}</p>
            <p><strong>Petition ID:</strong> ${petitionId}</p>
            <p><strong>New Status:</strong> 
              <span style="color: ${statusColors[newStatus]}; font-weight: bold; text-transform: uppercase;">
                ${newStatus.replace('_', ' ')}
              </span>
            </p>
            <p><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background-color: ${statusColors[newStatus]}20; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: ${statusColors[newStatus]}; font-weight: bold;">
              ${statusMessages[newStatus]}
            </p>
          </div>
          
          <p>You can view your petition and track its progress on our platform.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; font-size: 14px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
      Petition Status Update
      
      Dear ${userName},
      
      We have an update regarding your petition submission.
      
      Petition Details:
      - Title: ${petitionTitle}
      - Petition ID: ${petitionId}
      - New Status: ${newStatus.replace('_', ' ').toUpperCase()}
      - Updated: ${new Date().toLocaleString()}
      
      ${statusMessages[newStatus]}
      
      You can view your petition and track its progress on our platform.
      
      This is an automated message. Please do not reply to this email.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Status update email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending status update email:', error);
    throw error;
  }
};

// Send volunteer assignment notification
const sendVolunteerAssignmentEmail = async (emailData) => {
  const { to, volunteerName, petitionTitle, petitionId, creatorName } = emailData;
  let transporter;
  try {
    transporter = createTransporter();
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    throw error;
  }
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'ashritha.g2004@gmail.com',
    to: to,
    subject: `New Volunteer Assignment - ${petitionTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #007bff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">New Volunteer Assignment</h2>
        </div>
        
        <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
          <p>Dear ${volunteerName},</p>
          
          <p>You have been assigned as a volunteer to help with a petition. Thank you for your commitment to civic engagement!</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Assignment Details:</h3>
            <p><strong>Petition Title:</strong> ${petitionTitle}</p>
            <p><strong>Petition ID:</strong> ${petitionId}</p>
            <p><strong>Created by:</strong> ${creatorName}</p>
            <p><strong>Assigned:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>Please review the petition details and take appropriate action as a volunteer. You can access the petition through our platform.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; font-size: 14px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
      New Volunteer Assignment
      
      Dear ${volunteerName},
      
      You have been assigned as a volunteer to help with a petition. Thank you for your commitment to civic engagement!
      
      Assignment Details:
      - Petition Title: ${petitionTitle}
      - Petition ID: ${petitionId}
      - Created by: ${creatorName}
      - Assigned: ${new Date().toLocaleString()}
      
      Please review the petition details and take appropriate action as a volunteer. You can access the petition through our platform.
      
      This is an automated message. Please do not reply to this email.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Volunteer assignment email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending volunteer assignment email:', error);
    throw error;
  }
};

module.exports = {
  sendPetitionConfirmationEmail,
  sendStatusUpdateEmail,
  sendVolunteerAssignmentEmail
};
