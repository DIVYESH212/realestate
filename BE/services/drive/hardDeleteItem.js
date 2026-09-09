import DriveItem from '../../collections/drive';
import { getOwnerId, deletePhysicalFile } from './utils';

export const hardDeleteItem = async ({ params = {}, user = {} }) => {
  const id = params.id;
  const ownerId = getOwnerId(user);

  const item = await DriveItem.findOne({ _id: id, user_id: ownerId });
  if (!item) throw new Error('Item not found or unauthorized');

  if (item.isDirectory) {
    const folderPrefix = `${item.folderPath === '/' ? '' : item.folderPath}/${item.name}`;
    const subItems = await DriveItem.find({
      user_id: ownerId,
      $or: [{ folderPath: folderPrefix }, { folderPath: { $regex: `^${folderPrefix}/` } }]
    }).lean();

    for (const subItem of subItems) {
      if (!subItem.isDirectory && subItem.publicUrl) {
        deletePhysicalFile(subItem.publicUrl);
      }
    }

    await DriveItem.deleteMany({
      user_id: ownerId,
      $or: [{ folderPath: folderPrefix }, { folderPath: { $regex: `^${folderPrefix}/` } }]
    });
  } else {
    if (item.publicUrl) {
      deletePhysicalFile(item.publicUrl);
    }
  }

  await DriveItem.deleteOne({ _id: item._id, user_id: ownerId });

  return { message: 'Permanently deleted successfully', id };
};
