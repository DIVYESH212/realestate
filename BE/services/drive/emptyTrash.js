import DriveItem from '../../collections/drive';
import { getOwnerId, deletePhysicalFile } from './utils';

export const emptyTrash = async ({ user = {} }) => {
  const ownerId = getOwnerId(user);

  const trashItems = await DriveItem.find({
    user_id: ownerId,
    isDeleted: true
  }).lean();

  for (const item of trashItems) {
    if (!item.isDirectory && item.publicUrl) {
      deletePhysicalFile(item.publicUrl);
    }
  }

  const result = await DriveItem.deleteMany({
    user_id: ownerId,
    isDeleted: true
  });

  return { message: 'Trash emptied successfully', deletedCount: result.deletedCount };
};
