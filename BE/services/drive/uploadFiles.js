import path from 'path';
import DriveItem from '../../collections/drive';
import { detectCategory, getOwnerId } from './utils';

export const uploadFiles = async ({ files = [], body = {}, user = {} }) => {
  if (!files.length) throw new Error('No files uploaded');

  const folderPath = body.folderPath ? body.folderPath.trim() : '/';
  const ownerId = getOwnerId(user);
  const createdItems = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = file.originalname;
    const ext = path.extname(fileName).toLowerCase().replace('.', '');
    const category = detectCategory(fileName, file.mimetype);
    const publicUrl = `/public/uploads/${file.filename}`;

    const doc = await DriveItem.create({
      user_id: ownerId,
      name: fileName,
      folderPath: folderPath || '/',
      publicUrl,
      isDirectory: false,
      size: file.size,
      mimeType: file.mimetype,
      extension: ext,
      category,
    });

    createdItems.push(doc);
  }

  return { message: 'Uploaded successfully', count: createdItems.length, items: createdItems };
};
