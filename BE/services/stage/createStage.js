import mongoose from "mongoose";
import dbService from "../../utilities/dbService";
import { getOwnerId } from "../lead/utils";

export const createStage = async ({ body, user }) => {
  const ownerId = getOwnerId(user);
  if (!ownerId) {
    throw new Error('Authentication required to create stage.');
  }

  const userObjectId = mongoose.Types.ObjectId.isValid(ownerId)
    ? new mongoose.Types.ObjectId(ownerId)
    : ownerId;

  const { name, order } = body;
  const count = await dbService.recordsCount("stageModel", { user_id: userObjectId, isDeleted: false });

  let stageOrder = order != null ? Number(order) : count;


  const underContract = await dbService.findOneRecord("stageModel", {
    user_id: userObjectId,
    name: { $regex: /^under contract$/i },
    isDeleted: false
  });

  if (underContract) {
    stageOrder = underContract.order;
    await dbService.findOneAndUpdateRecord(
      "stageModel",
      { _id: underContract._id },
      { $set: { order: underContract.order + 1 } }
    );
  }

  const stage = await dbService.createOneRecord("stageModel", {
    name: (name || '').toString().trim(),
    order: stageOrder,
    user_id: userObjectId,
    created_by: userObjectId,
    isDeleted: false
  });

  return stage;
};
