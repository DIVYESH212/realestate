import path from 'path';
import fs from 'fs';

export const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const detectCategory = (filename = '', mimeType = '') => {
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  if (['xlsx', 'xls', 'csv', 'ods'].includes(ext)) return 'sheet';
  if (['docx', 'doc', 'txt', 'rtf', 'md'].includes(ext)) return 'doc';
  if (['pptx', 'ppt', 'odp', 'key'].includes(ext)) return 'slide';
  if (ext === 'pdf') return 'pdf';
  if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp'].includes(ext) || mimeType.startsWith('image/')) return 'image';
  if (['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext) || mimeType.startsWith('video/')) return 'video';
  if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext) || mimeType.startsWith('audio/')) return 'audio';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'zip';
  return 'other';
};

export const getOwnerId = (user) => user?.userId || user?.id || user?._id;

export const deletePhysicalFile = (publicUrl = '') => {
  if (!publicUrl) return;
  try {
    const filename = path.basename(publicUrl);
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Error deleting physical file:', err);
  }
};
