import dbService from "../../utilities/dbService";
import Message from "../../utilities/messages";
import { getOwnerId } from "./utils";

export const deleteLead = async ({ user, params }) => {
  const { id } = params;
  const ownerId = getOwnerId(user);

  const lead = await dbService.findOneAndUpdateRecord(
    "leadModel",
    { _id: id, user_id: ownerId, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
  if (!lead) {
    throw new Error(Message.recordNotFound);
  }
  return Message.recordUpdated;
};
