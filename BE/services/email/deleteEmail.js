import dbService from "../../utilities/dbService";
import { getOwnerId } from "../lead/utils";

export const deleteEmail = async ({ user, params, query }) => {
  const ownerId = getOwnerId(user);
  if (!ownerId) {
    throw new Error('Authentication required to delete email.');
  }
  
  const emailId = params.id || query.id;
  if (!emailId) {
    throw new Error('Email ID is required.');
  }

  const existingEmail = await dbService.findOneRecord("emailModel", {
    _id: emailId,
    user_id: ownerId
  });

  if (!existingEmail) {
    throw new Error('Email not found.');
  }

  await dbService.updateOneRecord(
    "emailModel",
    { _id: emailId, user_id: ownerId },
    { isDeleted: true, deletedAt: new Date() }
  );

  return { message: 'Email deleted successfully.', id: emailId };
};
