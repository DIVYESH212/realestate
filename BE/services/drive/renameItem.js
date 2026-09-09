import path from 'path';
import DriveItem from '../../collections/drive';
import { detectCategory, getOwnerId } from './utils';

const escapeRegex = (str = '') => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

export const renameItem = async ({ params = {}, body = {}, user = {} }) => {
  const id = params.id;
  const name = body.name;
  const ownerId = getOwnerId(user);

  if (!name || !name.trim()) throw new Error('Name cannot be empty');
  const cleanName = name.trim();

  const item = await DriveItem.findOne({ _id: id, user_id: ownerId, isDeleted: false });
  if (!item) throw new Error('Item not found or unauthorized');

  if (item.name === cleanName) return item;

  // Check for duplicate name in the same folder
  const duplicate = await DriveItem.findOne({
    _id: { $ne: id },
    user_id: ownerId,
    name: cleanName,
    folderPath: item.folderPath,
    isDirectory: item.isDirectory,
    isDeleted: false,
  });
  if (duplicate) {
    throw new Error(`An item named "${cleanName}" already exists in this folder`);
  }

  const oldName = item.name;
  item.name = cleanName;

  if (!item.isDirectory) {
    item.extension = path.extname(item.name).toLowerCase().replace('.', '');
    item.category = detectCategory(item.name, item.mimeType);
  }

  await item.save();

  // If folder renamed, directly update all child items' folderPath in MongoDB
  if (item.isDirectory) {
    const parent = item.folderPath === '/' ? '' : item.folderPath;
    const oldPrefix = `${parent}/${oldName}`;
    const newPrefix = `${parent}/${item.name}`;
    const escapedOldPrefix = escapeRegex(oldPrefix);

    await DriveItem.updateMany(
      {
        user_id: ownerId,
        $or: [
          { folderPath: oldPrefix },
          { folderPath: { $regex: `^${escapedOldPrefix}/` } }
        ],
        isDeleted: false
      },
      [
        {
          $set: {
            folderPath: {
              $replaceAll: {
                input: '$folderPath',
                find: oldPrefix,
                replacement: newPrefix
              }
            }
          }
        }
      ]
    );
  }

  return item;
};
