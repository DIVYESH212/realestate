import DriveItem from '../../collections/drive';
import { getOwnerId } from './utils';

export const createFolder = async ({ body = {}, user = {} }) => {
  const { name, folderPath = '/' } = body;
  if (!name || !name.trim()) throw new Error('Folder name is required');
  const cleanName = name.trim();
  const cleanPath = folderPath.trim() || '/';
  const ownerId = getOwnerId(user);

  const exists = await DriveItem.findOne({
    user_id: ownerId,
    name: cleanName,
    folderPath: cleanPath,
    isDirectory: true,
    isDeleted: false,
  });

  if (exists) throw new Error('Folder already exists in this directory');

  const folder = await DriveItem.create({
    user_id: ownerId,
    name: cleanName,
    folderPath: cleanPath,
    isDirectory: true,
    category: 'folder',
  });

  return folder;
};
