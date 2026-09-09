import dbService from "../../utilities/dbService";
import { getOwnerId } from "../lead/utils";
import nodemailer from "nodemailer";

const getTransporter = () => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS || !EMAIL_HOST || EMAIL_HOST === 'smtp.example.com') {
    return null;
  }

  const port = parseInt(EMAIL_PORT, 10) || 465;
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: port,
    secure: port === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
};

export const sendEmail = async ({ user, body }) => {
  const ownerId = getOwnerId(user);
  if (!ownerId) {
    throw new Error('Authentication required to send email.');
  }

  const { lead_id, to, recipientName, subject, message, from, senderName } = body;

  let resolvedFrom = from || '';
  let resolvedSenderName = senderName || '';

  if (!resolvedFrom || !resolvedSenderName) {
    const userDoc = await dbService.findOneRecord("userModel", { _id: ownerId });
    if (userDoc) {
      if (!resolvedFrom) resolvedFrom = userDoc.email || '';
      if (!resolvedSenderName) resolvedSenderName = userDoc.name || userDoc.username || 'User';
    }
  }

  let emailStatus = 'sent';
  let sendError = null;

  const transporter = getTransporter();
  if (transporter) {
    try {
      const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || resolvedFrom || '';
      await transporter.sendMail({
        from: `"${resolvedSenderName || 'User'}" <${fromAddress}>`,
        to: (to || '').trim(),
        replyTo: resolvedFrom || fromAddress,
        subject: (subject || '').trim(),
        text: (message || '').trim(),
        html: `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</div>`
      });
      emailStatus = 'delivered';
    } catch (err) {
      console.error("Nodemailer SMTP delivery error:", err);
      emailStatus = 'failed';
      sendError = err.message || 'SMTP delivery failed';
    }
  }

  const emailRecord = await dbService.createOneRecord("emailModel", {
    lead_id: lead_id || undefined,
    user_id: ownerId,
    type: 'sent',
    from: resolvedFrom || user?.email || '',
    senderName: resolvedSenderName || user?.name || 'User',
    to: (to || '').trim(),
    recipientName: (recipientName || '').trim(),
    subject: (subject || '').trim(),
    message: (message || '').trim(),
    status: emailStatus,
    isDeleted: false,
    dateCreated: new Date()
  });

  if (sendError) {
    throw new Error(`Email delivery failed: ${sendError}`);
  }

  return emailRecord;
};

