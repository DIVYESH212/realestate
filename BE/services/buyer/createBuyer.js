import dbService from "../../utilities/dbService";
import Message from "../../utilities/messages";
import { getOwnerId } from "./utils";

export const createBuyer = async ({ body = {}, user }) => {
  const userId = getOwnerId(user);
  if (!userId) {
    throw new Error(Message.unauthorizedUser || 'Authentication required to create buyer.');
  }

  const {
    name = '',
    mobilenumber = '',
    email = '',
    propertyAddress = '',
    status = 'active',
    lead_ids = [],
    lead_id,
    notes = ''
  } = body;

  const resolvedLeadIds = Array.isArray(lead_ids) && lead_ids.length > 0
    ? lead_ids.filter(Boolean)
    : (lead_id ? [lead_id] : []);

  const buyer = await dbService.createOneRecord("buyerModel", {
    name: name.trim(),
    mobilenumber: mobilenumber.trim(),
    email: email.trim().toLowerCase(),
    propertyAddress: propertyAddress.trim(),
    status: resolvedLeadIds.length > 0 ? (status === 'active' ? 'assign' : status) : status,
    lead_ids: resolvedLeadIds,
    notes: notes.trim(),
    user_id: userId,
  });

  return buyer;
};

