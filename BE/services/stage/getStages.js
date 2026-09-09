import mongoose from "mongoose";
import dbService from "../../utilities/dbService";
import { getOwnerId } from "../lead/utils";

export const defaultStages = [
  { name: 'New Leads', order: 0 },
  { name: 'No Contact Made', order: 1 },
  { name: 'Contact Made', order: 2 },
  { name: 'Appointments Set', order: 3 },
  { name: 'Due Diligence', order: 4 },
  { name: 'Offers Made', order: 5 },
  { name: 'Under Contract', order: 6 }
];

export const getStages = async ({ user }) => {
  const ownerId = getOwnerId(user);
  if (!ownerId) {
    return defaultStages;
  }

  const userObjectId = mongoose.Types.ObjectId.isValid(ownerId)
    ? new mongoose.Types.ObjectId(ownerId)
    : ownerId;

  let stages = await dbService.findAllRecords(
    "stageModel",
    { user_id: userObjectId, isDeleted: false },
    {},
    { order: 1, createdAt: 1 }
  );

  if (!stages || stages.length === 0) {
    const seedData = defaultStages.map(s => ({
      ...s,
      user_id: userObjectId,
      created_by: userObjectId,
      isDeleted: false
    }));
    await dbService.createManyRecords("stageModel", seedData);

    stages = await dbService.findAllRecords(
      "stageModel",
      { user_id: userObjectId, isDeleted: false },
      {},
      { order: 1, createdAt: 1 }
    );
  }

  return stages;
};
