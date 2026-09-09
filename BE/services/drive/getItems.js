import mongoose from 'mongoose';
import DriveItem from '../../collections/drive';
import { getOwnerId } from './utils';

export const getItems = async ({ query = {}, user = {} }) => {
  const { folderPath = '/' } = query;
  const cleanPath = (folderPath || '/').trim() || '/';
  const ownerId = getOwnerId(user);

  const userObjectId = mongoose.Types.ObjectId.isValid(ownerId)
    ? new mongoose.Types.ObjectId(ownerId)
    : ownerId;

  const dbQuery = {
    user_id: ownerId,
    isDeleted: false,
    folderPath: cleanPath
  };

  // Prioritize directories on top, then newest first
  const items = await DriveItem.find(dbQuery)
    .sort({ isDirectory: -1, createdAt: -1 })
    .lean();

  const stats = await DriveItem.aggregate([
    {
      $match: {
        user_id: userObjectId,
        isDeleted: false,
        isDirectory: false
      }
    },
    { $group: { _id: null, totalBytes: { $sum: '$size' }, count: { $sum: 1 } } }
  ]);

  return {
    items: items || [],
    currentPath: cleanPath,
    totalFiles: stats?.[0]?.count || 0,
    totalStorageBytes: stats?.[0]?.totalBytes || 0,
  };
};
