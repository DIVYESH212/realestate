import mongoose from 'mongoose';
import DriveItem from '../../collections/drive';
import { getOwnerId } from './utils';

export const getTrashItems = async ({ query = {}, user = {} }) => {
  const ownerId = getOwnerId(user);

  const userObjectId = mongoose.Types.ObjectId.isValid(ownerId)
    ? new mongoose.Types.ObjectId(ownerId)
    : ownerId;

  const dbQuery = {
    user_id: ownerId,
    isDeleted: true
  };

  const items = await DriveItem.find(dbQuery)
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean();

  const stats = await DriveItem.aggregate([
    {
      $match: {
        user_id: userObjectId,
        isDeleted: true,
        isDirectory: false
      }
    },
    { $group: { _id: null, totalBytes: { $sum: '$size' }, count: { $sum: 1 } } }
  ]);

  return {
    items: items || [],
    totalFiles: stats?.[0]?.count || 0,
    totalStorageBytes: stats?.[0]?.totalBytes || 0,
  };
};
