export interface EmailRecord {
  _id: string;
  id?: string;
  lead_id?: string;
  user_id: string;
  type: 'sent';
  status: 'sent' | 'delivered' | 'failed';
  from: string;
  senderName?: string;
  to: string;
  recipientName?: string;
  subject: string;
  message: string;
  isDeleted?: boolean;
  deletedAt?: string | Date;
  dateCreated?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface EmailStats {
  total: number;
}

export interface SendEmailPayload {
  lead_id?: string;
  from?: string;
  senderName?: string;
  to: string;
  recipientName?: string;
  subject: string;
  message: string;
}

