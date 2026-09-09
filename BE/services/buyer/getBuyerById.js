import mongoose from "mongoose";
import collections from "../../collections";
import { getOwnerId } from "./utils";
import Message from "../../utilities/messages";

export const getBuyerById = async ({ user, params }) => {
  const { id } = params;
  const ownerId = getOwnerId(user);

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(Message.buyerNotFound || "Invalid or missing Buyer ID.");
  }

  const buyerObjectId = new mongoose.Types.ObjectId(id);
  const userObjectId = mongoose.Types.ObjectId.isValid(ownerId)
    ? new mongoose.Types.ObjectId(ownerId)
    : ownerId;

  const matchQuery = {
    _id: buyerObjectId,
    user_id: userObjectId,
    isDeleted: { $ne: true }
  };

  let buyer = await collections.buyerModel
    .findOne(matchQuery)
    .populate('lead_ids')
    .lean();

  if (!buyer) {
    buyer = await collections.buyerModel
      .findOne({ _id: buyerObjectId, isDeleted: { $ne: true } })
      .populate('lead_ids')
      .lean();
  }

  if (!buyer) {
    throw new Error(Message.buyerNotFound || "Buyer not found or unauthorized.");
  }

  return buyer;
};
