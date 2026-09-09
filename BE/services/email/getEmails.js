import dbService from "../../utilities/dbService";
import { getOwnerId } from "../lead/utils";

export const getEmails = async ({ user, query, body }) => {
  const ownerId = getOwnerId(user);
  if (!ownerId) {
    throw new Error('Authentication required to fetch emails.');
  }

  const queryData = {
    ...query,
    ...body
  };

  const lead_id = queryData.lead_id;
  const search = (queryData.search || '').toString().trim();

  const filter = {
    user_id: ownerId,
    isDeleted: { $ne: true }
  };

  if (lead_id) {
    filter.lead_id = lead_id;
  }

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escapedSearch, 'i');
    filter.$or = [
      { subject: searchRegex },
      { message: searchRegex },
      { from: searchRegex },
      { to: searchRegex },
      { senderName: searchRegex },
      { recipientName: searchRegex }
    ];
  }

  const emails = await dbService.findAllRecords("emailModel", filter);

  return {
    emails: emails || [],
    total: emails ? emails.length : 0
  };
};

