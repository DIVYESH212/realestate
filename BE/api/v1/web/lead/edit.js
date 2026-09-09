import { Router } from "express";
import commonResolver from "../../../../utilities/commonResolver";
import { updateLead } from "../../../../services/lead/updateLead";
import { leadSaveSchema } from "./save";

/**
 * @swagger
 * /leads/{id}:
 *   put:
 *     tags: [Lead]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the lead
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:        
 *             $ref: '#/components/schemas/Lead'
 *     responses:
 *       200:
 *         description: Lead updated
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error         
 */


export const leadEditSchema = leadSaveSchema;

const router = Router();

router.put("/:id", commonResolver.bind({ modelService: updateLead, isRequestValidateRequired: true, schemaValidate: leadEditSchema }));

export default router;
