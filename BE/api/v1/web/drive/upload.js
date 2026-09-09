import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadFiles } from '../../../../services/drive';
import { successAction, failAction } from '../../../../utilities/response';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const cleanOriginalName = (file.originalname || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueName = `${Date.now()}-${cleanOriginalName}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

const router = Router();

router.post('/upload', upload.any(), async (req, res) => {
  try {
    const result = await uploadFiles({ files: req.files, body: req.body, user: req.user });
    return res.status(200).json(successAction(result));
  } catch (e) {
    return res.status(400).json(failAction(e.message));
  }
});

export default router;
