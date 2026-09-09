import { Router } from "express";
import Joi from "joi";
import { successAction, failAction } from "../../../../utilities/response";
import Message from "../../../../utilities/messages";
import { importExcelLeads } from "../../../../services/lead/importExcelLeads";
import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * @swagger
 * /leads/upload-excel:
 *   post:
 *     tags: [Lead]
 *     security:
 *       - bearerAuth: []
 *     summary: Import Excel File
 *     description: Upload and import an Excel file containing leads
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               excelFile:
 *                 type: string
 *                 format: binary
 *                 description: Excel File (.xlsx, .xls)
 *             required:
 *               - excelFile
 *     responses:
 *       200:
 *         description: File processed successfully
 *       400:
 *         description: Bad request        
 *       500:
 *         description: Internal server error           
 */

export const importExcelSchema = Joi.object({}).unknown(true);

const router = Router();

// Multer configuration
const uploadDir = path.join(__dirname, "..", "..", "..", "..", "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.post("/upload-excel", upload.single("excelFile"), async (req, res, next) => {
  try {
    const { error } = importExcelSchema.validate(req.body || {});
    if (error) {
      return res.status(400).json(failAction(error.details[0].message.toString().replace(/[\""]+/g, "")));
    }
    const result = await importExcelLeads({ user: req.user, file: req.file });
    res.status(200).json(successAction(result, Message.success || "File processed successfully"));
  } catch (error) {
    res.status(400).json(failAction(error.message));
  }
});

export default router;
