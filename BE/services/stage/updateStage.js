import mongoose from "mongoose";
import dbService from "../../utilities/dbService";
import { getOwnerId } from "../lead/utils";

export const updateStage = async ({ body, user, params }) => {
  const { id } = params;
  const ownerId = getOwnerId(user);
  const userObjectId = mongoose.Types.ObjectId.isValid(ownerId)
    ? new mongoose.Types.ObjectId(ownerId)
    : ownerId;
  const stageObjectId = mongoose.Types.ObjectId.isValid(id)
    ? new mongoose.Types.ObjectId(id)
    : id;

  const { name, order } = body;

  const updateFields = {};
  if (name !== undefined) updateFields.name = (name || '').toString().trim();
  if (order !== undefined) updateFields.order = Number(order);

  const stage = await dbService.findOneAndUpdateRecord(
    "stageModel",
    { _id: stageObjectId, user_id: userObjectId },
    { $set: updateFields },
    { new: true }
  );

  if (!stage) {
    throw new Error('Stage not found or unauthorized');
  }

  // If stage name changed, optionally update leadstatus in leads for consistency
  if (name) {
    await dbService.updateManyRecords(
      "leadModel",
      { stage_id: id, user_id: ownerId },
      { $set: { leadstatus: name.trim() } }
    );
  }

  return stage;
};
