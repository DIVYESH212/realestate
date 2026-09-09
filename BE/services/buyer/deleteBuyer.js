import mongoose from "mongoose";
import dbService from "../../utilities/dbService";
import Message from "../../utilities/messages";
import { getOwnerId } from "./utils";

export const deleteBuyer = async ({ user, params }) => {
  const userId = getOwnerId(user);
  const userObjectId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  const buyer = await dbService.findOneAndUpdateRecord(
    "buyerModel",
    { 
      _id: params.id, 
      $or: [{ user_id: userObjectId }, { user_id: userId.toString() }],
      isDeleted: { $ne: true }
    },
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!buyer) {
    throw new Error(Message.recordNotFound);
  }
  return Message.recordUpdated;
};
