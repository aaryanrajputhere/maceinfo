import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";

// Don't set the API key globally - set it in each function
// sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
const SECRET = process.env.SECRET;

export const sendRFQEmail = async (
  rfqId: string,
  projectInfo: any,
  items: any[],
  vendor: { email: string; name: string },
  driveLinks: string[]
) => {
  console.log(
    `🔍 sendRFQEmail called for vendor: ${vendor.email}, rfqId: ${rfqId}`
  );

  try {
    // Check if SendGrid API key is available and set it
    const apiKey = process.env.SENDGRID_API_KEY;
    console.log(`🔑 SendGrid API Key available: ${apiKey ? "Yes" : "No"}`);

    if (!apiKey) {
      throw new Error("SendGrid API key not found in environment variables");
    }

    sgMail.setApiKey(apiKey);
    console.log(`✅ SendGrid API key set for RFQ email`);

    if (!SECRET) {
      throw new Error("JWT secret not found in environment variables");
    }
    const secret = SECRET;

    const token = jwt.sign(
      { vendorName: vendor.name, vendorEmail: vendor.email, rfqId },
      secret,
      { expiresIn: "7d" }
    );

    const secureLink = `https://maceinfo.com/vendor-reply/${rfqId}/${token}`;



    const materialsList = items
      .map(
        (item, idx) =>
          `- ${
            item["Item Name"] ||
            item.name ||
            item.description ||
            `Item ${idx + 1}`
          }: ` +
          `${item["Size/Option"] || item.size || ""}${
            item["Size/Option"] || item.size ? ", " : ""
          }` +
          `${item["Unit"] || item.unit || ""}${
            item["Unit"] || item.unit ? ", " : ""
          }` +
          `Qty: ${item["Quantity"] || item.qty || ""}${
            item["Notes"] || item.notes ? `, Notes: ${item["Notes"] || item.notes}` : ""
          }`
      )
      .join("<br>");

    console.log("Sending Email to:", vendor.email);
    const msg = {
      to: vendor.email, // Send to actual vendor
      from: "rfq@maceinfo.com", // Verified sender
      subject: `RFQ Request – ${projectInfo.projectName}, RFQ ID #${rfqId}`,
      html: `
        <p>Hello ${vendor.name},</p>
        <p>We are requesting pricing and lead time for the following materials:</p>
        <p><strong>Project:</strong> ${projectInfo.projectName}</p>
        <p><strong>Site Address:</strong> ${projectInfo.siteAddress || ""}</p>
        <p><strong>Needed By:</strong> ${projectInfo.neededBy || ""}</p>
        ${projectInfo.notes ? `<p><strong>Project Notes:</strong> ${projectInfo.notes}</p>` : ""}
        <p><strong>Requested Materials:</strong><br>${materialsList}</p>
        <p>Files: ${driveLinks
          .map((l) => `<a href="${l}">File</a>`)
          .join(", ")}</p>
        <p>Please submit your pricing and lead time using your secure vendor link below:<br>
        <a href="${secureLink}">Submit Your Reply</a></p>
        <p>This link is unique to you and will expire in 7 days.</p>
        <p>Thank you,<br>Maceinfo RFQ System<br>rfq@maceinfo.com</p>
      `,
    };


    const result = await sgMail.send(msg);
    console.log(
      "✅ RFQ Email sent successfully to:",
      vendor.email,
      result[0]?.statusCode
    );
  } catch (error) {
    console.error("❌ Error sending RFQ email to:", vendor.email, error);
    throw error;
  }
};

export const rfqAward = async (email: string, rfqId: string) => {
  console.log(`🔍 rfqAward called with email: ${email}, rfqId: ${rfqId}`);

  try {
    // Check if SendGrid API key is available
    const apiKey = process.env.SENDGRID_API_KEY;
    console.log(`🔑 SendGrid API Key available: ${apiKey ? "Yes" : "No"}`);

    if (!apiKey) {
      throw new Error("SendGrid API key not found in environment variables");
    }

    // Set SendGrid API key
    sgMail.setApiKey(apiKey);
    console.log(`✅ SendGrid API key set successfully`);

    if (!SECRET) {
      throw new Error("JWT secret not found in environment variables");
    }

    const token = jwt.sign({ email, rfqId }, SECRET, { expiresIn: "7d" });
    console.log(`🎟️ JWT token generated: ${token.substring(0, 20)}...`);

    // Generate JWT token with email and rfqId using utility function
    const secureLink = `https://maceinfo.com/award/${rfqId}/${token}`;
    console.log(`🔗 Secure link generated: ${secureLink}`);

    // Email content
    const msg = {
      to: email,
      from: "rfq@maceinfo.com",
      subject: `RFQ Award Access - RFQ ID #${rfqId}`,
      html: `
        <p>Hello,</p>
        <p>You have been granted access to award RFQ #${rfqId}.</p>
        <p>Please use the secure link below to access the award interface:</p>
        <p><a href="${secureLink}" style="background-color: #033159; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Access Award Interface</a></p>
        <p>Or copy and paste this link: ${secureLink}</p>
        <p>This link is secure and will expire in 7 days.</p>
        <p>Thank you,<br>Maceinfo RFQ System<br>rfq@maceinfo.com</p>
      `,
    };

    console.log(`📧 Email message prepared for: ${email}`);
    console.log(`📧 Email subject: ${msg.subject}`);

    // Send email
    console.log(`🚀 Attempting to send email via SendGrid...`);
    const result = await sgMail.send(msg);
    console.log(`✅ Email sent successfully!`, result[0]?.statusCode);
    console.log(`Award access email sent to ${email} for RFQ ${rfqId}`);

    return {
      success: true,
      message: `Award access email sent to ${email}`,
    };
  } catch (error) {
    console.error("❌ Error sending award access email:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      response: (error as any)?.response?.body,
    });
    throw error;
  }
};

export const vendorAwardNotification = async (
  email: string,
  rfqId: string,
  itemName: string,
  vendorName: string,
  projectName: string,
  address: string,
  neededByDate: string,
  rfqDate: string,
  buyerName: string,
  buyerEmail: string,
  buyerPhone: string
) => {
  console.log(`📨 Preparing to send vendor award notification...`);
  console.log(`🔹 Email: ${email}`);
  console.log(`🔹 RFQ ID: ${rfqId}`);
  console.log(`🔹 Item Name: ${itemName}`);
  console.log(`🔹 Vendor Name: ${vendorName}`);

  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error("SendGrid API key is missing in environment variables");
    }

    sgMail.setApiKey(apiKey);
    console.log(`✅ SendGrid API key set successfully.`);

    const msg = {
      to: email,
      from: "rfq@maceinfo.com",
      subject: `🎉 You've Been Awarded an Item for RFQ #${rfqId}!`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2E86C1;">Congratulations, ${vendorName}!</h2>
          <p>Hello,</p>
          <p>
            We are pleased to inform you that you have been 
            <strong>awarded the item "${itemName}"</strong> for 
            <strong>RFQ #${rfqId}</strong>.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #033159; margin-top: 0;">Project Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 180px;">Project Name:</td>
                <td style="padding: 8px 0;">${projectName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Address:</td>
                <td style="padding: 8px 0;">${address}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Needed By:</td>
                <td style="padding: 8px 0;">${neededByDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">RFQ Date:</td>
                <td style="padding: 8px 0;">${rfqDate}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #033159; margin-top: 0;">Buyer Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 180px;">Buyer Name:</td>
                <td style="padding: 8px 0;">${buyerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${buyerEmail}" style="color: #2E86C1; text-decoration: none;">${buyerEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                <td style="padding: 8px 0;"><a href="tel:${buyerPhone}" style="color: #2E86C1; text-decoration: none;">${buyerPhone}</a></td>
              </tr>
            </table>
          </div>

          <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2E86C1;">
            <h3 style="color: #033159; margin-top: 0;">Awarded Item</h3>
            <p style="font-size: 18px; margin: 0; font-weight: bold; color: #033159;">${itemName}</p>
          </div>

          <p>
            Please reach out to the buyer directly using the contact information above to coordinate the next steps for delivery and payment.
          </p>
          
          <p>Thank you for participating in our RFQ process!</p>
          
          <p style="margin-top: 24px;">
            Best regards,<br>
            <strong>Maceinfo RFQ System</strong><br>
            <a href="mailto:rfq@maceinfo.com" style="color: #2E86C1; text-decoration: none;">rfq@maceinfo.com</a>
          </p>
        </div>
      `,
    };

    console.log(`🚀 Sending award notification email to ${email}...`);

    const [response] = await sgMail.send(msg);
    console.log(
      `✅ Email sent successfully with status ${response.statusCode}`
    );

    return {
      success: true,
      message: `Award notification email sent successfully to ${email}`,
      statusCode: response.statusCode,
    };
  } catch (error) {
    console.error("❌ Failed to send vendor award email.");
    const err = error as any;
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      response: err.response?.body,
      stack: err.stack,
    });

    return {
      success: false,
      message: `Error sending award notification email: ${err.message}`,
      details: err.response?.body || null,
    };
  }
};

export const userAwardNotification = async (
  email: string,
  rfqId: string,
  itemName: string,
  vendorName: string
) => {
  console.log(`📨 Preparing to send user award notification...`);
  console.log(`🔹 Email: ${email}`);
  console.log(`🔹 RFQ ID: ${rfqId}`);
  console.log(`🔹 Item Name: ${itemName}`);
  console.log(`🔹 Vendor Name: ${vendorName}`);

  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error("SendGrid API key is missing in environment variables");
    }

    sgMail.setApiKey(apiKey);
    console.log(`✅ SendGrid API key set successfully.`);

    const msg = {
      to: email,
      from: "rfq@maceinfo.com",
      subject: `✅ You Have Awarded ${vendorName} for RFQ #${rfqId}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #2E86C1;">Award Confirmation</h2>
          <p>Hello,</p>
          <p>
            This is to confirm that you have successfully 
            <strong>awarded the item "${itemName}"</strong> 
            to <strong>${vendorName}</strong> for 
            <strong>RFQ #${rfqId}</strong>.
          </p>
          <p>
            The vendor has been notified and can now proceed with the next steps.
          </p>
          <p>Thank you for using the Maceinfo RFQ System.</p>
          <p style="margin-top: 24px;">
            Best regards,<br>
            <strong>Maceinfo RFQ System</strong><br>
            <a href="mailto:rfq@maceinfo.com">rfq@maceinfo.com</a>
          </p>
        </div>
      `,
    };

    console.log(`🚀 Sending award notification email to ${email}...`);

    const [response] = await sgMail.send(msg);
    console.log(
      `✅ Email sent successfully with status ${response.statusCode}`
    );

    return {
      success: true,
      message: `Award notification email sent successfully to ${email}`,
      statusCode: response.statusCode,
    };
  } catch (error) {
    console.error("❌ Failed to send user award email.");
    const err = error as any;
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      response: err.response?.body,
      stack: err.stack,
    });

    return {
      success: false,
      message: `Error sending award notification email: ${err.message}`,
      details: err.response?.body || null,
    };
  }
};

export const sendReplyConfirmation = async (
  email: string,
  rfqId: string,
  replyId: string
) => {
  console.log(
    `🔍 sendReplyConfirmation called with email: ${email}, rfqId: ${rfqId}, replyId: ${replyId}`
  );

  try {
    // Check if SendGrid API key is available
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error("SendGrid API key not found in environment variables");
    }

    // Set SendGrid API key
    sgMail.setApiKey(apiKey);
    console.log(`✅ SendGrid API key set for reply confirmation`);

    // Email content
    const msg = {
      to: email,
      from: "rfq@maceinfo.com",
      subject: `Reply Confirmation - RFQ ID #${rfqId}`,
      html: `
        <p>Hello,</p>
        <p>Thank you for submitting your reply for RFQ #${rfqId}.</p>
        <p><strong>Reply ID:</strong> ${replyId}</p>
        <p>Your reply has been submitted successfully and is now under review.</p>
        <p>You will be notified by email if you have been awarded this RFQ.</p>
        <p>Thank you for your participation in our RFQ process.</p>
        <p>Best regards,<br>Maceinfo RFQ System<br>rfq@maceinfo.com</p>
      `,
    };

    console.log(`📧 Reply confirmation email prepared for: ${email}`);

    // Send email
    const result = await sgMail.send(msg);
    console.log(
      `✅ Reply confirmation email sent successfully!`,
      result[0]?.statusCode
    );
    console.log(
      `Reply confirmation email sent to ${email} for RFQ ${rfqId}, Reply ${replyId}`
    );

    return {
      success: true,
      message: `Reply confirmation email sent to ${email}`,
    };
  } catch (error) {
    console.error("❌ Error sending reply confirmation email:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      response: (error as any)?.response?.body,
    });
    throw error;
  }
};

// Test function to verify SendGrid configuration
export const testSendGridConnection = async (testEmail: string) => {
  console.log(`🧪 Testing SendGrid connection with email: ${testEmail}`);

  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    console.log(`🔑 SendGrid API Key available: ${apiKey ? "Yes" : "No"}`);

    if (!apiKey) {
      throw new Error("SendGrid API key not found in environment variables");
    }

    sgMail.setApiKey(apiKey);

    const msg = {
      to: testEmail,
      from: "rfq@maceinfo.com",
      subject: "Test Email - SendGrid Configuration",
      html: `
        <p>Hello,</p>
        <p>This is a test email to verify that SendGrid is working correctly.</p>
        <p>If you receive this email, the configuration is working!</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>Best regards,<br>Maceinfo System</p>
      `,
    };

    const result = await sgMail.send(msg);
    console.log(`✅ Test email sent successfully!`, result[0]?.statusCode);

    return {
      success: true,
      message: `Test email sent to ${testEmail}`,
      statusCode: result[0]?.statusCode,
    };
  } catch (error) {
    console.error("❌ Error sending test email:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      error,
    };
  }
};

export const sendAwardNotification = async (email: string, rfqId: string) => {
  console.log(
    `🔍 sendAwardNotification called with email: ${email}, rfqId: ${rfqId}`
  );
  try {
    // Check if SendGrid API key is available and set it
    const apiKey = process.env.SENDGRID_API_KEY;
    console.log(`🔑 SendGrid API Key available: ${apiKey ? "Yes" : "No"}`);
    if (!apiKey) {
      throw new Error("SendGrid API key not found in environment variables");
    }
    sgMail.setApiKey(apiKey);
    console.log(`✅ SendGrid API key set for award notification`);
    // Email content
    const msg = {
      to: email,
      from: "rfq@maceinfo.com",
      subject: `Congratulations! You've Been Awarded RFQ ID #${rfqId}`,
      html: `
        <p>Hello,</p>
        <p>We are pleased to inform you that you have been awarded RFQ #${rfqId}.</p>
        <p>Please log in to your vendor portal to view the details and next steps.</p>
        <p>Thank you for your participation in our RFQ process.</p>
        <p>Best regards,<br>Maceinfo RFQ System<br>rfq@maceinfo.com</p>
      `,
    };
    console.log(`📧 Award notification email prepared for: ${email}`);
    // Send email
    const result = await sgMail.send(msg);
    console.log(
      `✅ Award notification email sent successfully!`,
      result[0]?.statusCode
    );
    console.log(`Award notification email sent to ${email} for RFQ ${rfqId}`);
    return {
      success: true,
      message: `Award notification email sent to ${email} for RFQ ${rfqId}`,
    };
  } catch (error) {
    console.error("❌ Error sending award notification email:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      response: (error as any)?.response?.body,
    });
    throw error;
  }
};
