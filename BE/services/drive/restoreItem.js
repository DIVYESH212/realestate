import DriveItem from '../../collections/drive';
import { getOwnerId } from './utils';

export const restoreItem = async ({ params = {}, user = {} }) => {
  const id = params.id;
  const ownerId = getOwnerId(user);

  const item = await DriveItem.findOne({ _id: id, user_id: ownerId, isDeleted: true });
  if (!item) throw new Error('Item not found in trash or unauthorized');

  item.isDeleted = false;
  await item.save();

  if (item.isDirectory) {
    const folderPrefix = `${item.folderPath === '/' ? '' : item.folderPath}/${item.name}`;
    await DriveItem.updateMany(
      {
        user_id: ownerId,
        $or: [{ folderPath: folderPrefix }, { folderPath: { $regex: `^${folderPrefix}/` } }]
      },
      { $set: { isDeleted: false } }
    );
  }

  return { message: 'Restored successfully', id };
};
