import dbService from "../../utilities/dbService";
import Message from "../../utilities/messages";
import { getOwnerId } from "./utils";

export const updateBuyer = async ({ body = {}, user, params = {} }) => {
  const userId = getOwnerId(user);
  const { id } = params;

  const trim = (val) => (typeof val === "string" ? val.trim() : val);

  const {
    name,
    mobilenumber,
    email,
    propertyAddress,
    notes,
    status,
    lead_ids,
    lead_id,
    isDeleted
  } = body;

  const updateData = {};

  if (name !== undefined) updateData.name = trim(name);
  if (mobilenumber !== undefined) updateData.mobilenumber = trim(mobilenumber);
  if (email !== undefined) updateData.email = trim(email)?.toLowerCase();
  if (propertyAddress !== undefined) updateData.propertyAddress = trim(propertyAddress);
  if (notes !== undefined) updateData.notes = trim(notes);
  if (status !== undefined) updateData.status = trim(status);

  if (lead_ids !== undefined) {
    updateData.lead_ids = Array.isArray(lead_ids) ? lead_ids : [];
  } else if (lead_id !== undefined) {
    updateData.lead_ids = lead_id ? [lead_id] : [];
  }

  if (isDeleted !== undefined) updateData.isDeleted = Boolean(isDeleted);

  const buyer = await dbService.findOneAndUpdateRecord(
    "buyerModel",
    { _id: id, user_id: userId },
    { $set: updateData },
    { new: true }
  );

  if (!buyer) {
    throw new Error(Message.recordNotFound);
  }

  return buyer;
};

