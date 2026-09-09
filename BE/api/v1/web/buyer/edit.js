import { Router } from "express";
import commonResolver from "../../../../utilities/commonResolver";
import { updateBuyer } from "../../../../services/buyer/updateBuyer";
import { buyerSaveSchema } from "./save";

/**
 * @swagger
 * /buyer/{id}:
 *   put:
 *     tags:
 *       - Buyer
 *     summary: Update a buyer
 *     description: Update a buyer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the buyer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:        
 *             $ref: '#/components/schemas/Buyer'
 *     responses:
 *       200:
 *         description: Buyer updated
 *       400:
 *         description: Bad request  
 */

export const buyerEditSchema = buyerSaveSchema;

const router = Router();

router.put("/:id", commonResolver.bind({ modelService: updateBuyer, isRequestValidateRequired: true, schemaValidate: buyerEditSchema }));

export default router;
