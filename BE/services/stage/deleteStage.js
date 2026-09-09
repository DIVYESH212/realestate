import mongoose from "mongoose";
import dbService from "../../utilities/dbService";
import { getOwnerId } from "../lead/utils";

const PROTECTED_STAGE_NAMES = ['new leads', 'under contract'];

export const deleteStage = async ({ user, params }) => {
  const { id } = params;
  const ownerId = getOwnerId(user);
  const userObjectId = mongoose.Types.ObjectId.isValid(ownerId)
    ? new mongoose.Types.ObjectId(ownerId)
    : ownerId;
  const stageObjectId = mongoose.Types.ObjectId.isValid(id)
    ? new mongoose.Types.ObjectId(id)
    : id;

  const existingStage = await dbService.findOneRecord("stageModel", {
    _id: stageObjectId,
    user_id: userObjectId,
    isDeleted: false
  });

  if (!existingStage) {
    throw new Error('Stage not found or unauthorized');
  }

  const stageName = (existingStage.name || '').toLowerCase().trim();
  if (PROTECTED_STAGE_NAMES.includes(stageName)) {
    throw new Error(`The "${existingStage.name}" stage is protected and cannot be deleted.`);
  }

  const stage = await dbService.findOneAndUpdateRecord(
    "stageModel",
    { _id: stageObjectId, user_id: userObjectId },
    { $set: { isDeleted: true } },
    { new: true }
  );

  return { message: 'Stage deleted successfully', id };
};
