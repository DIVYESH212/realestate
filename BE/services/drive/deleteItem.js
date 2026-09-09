import DriveItem from '../../collections/drive';
import { getOwnerId } from './utils';

export const deleteItem = async ({ params = {}, user = {} }) => {
  const id = params.id;
  const ownerId = getOwnerId(user);

  const item = await DriveItem.findOne({ _id: id, user_id: ownerId, isDeleted: false });
  if (!item) throw new Error('Item not found or unauthorized');

  item.isDeleted = true;
  await item.save();

  if (item.isDirectory) {
    const folderPrefix = `${item.folderPath === '/' ? '' : item.folderPath}/${item.name}`;
    await DriveItem.updateMany(
      {
        user_id: ownerId,
        $or: [{ folderPath: folderPrefix }, { folderPath: { $regex: `^${folderPrefix}/` } }]
      },
      { $set: { isDeleted: true } }
    );
  }

  return { message: 'Deleted successfully', id };
};
