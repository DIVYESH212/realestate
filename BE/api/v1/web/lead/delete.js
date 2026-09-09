import { Router } from "express";
import Joi from "joi";
import commonResolver from "../../../../utilities/commonResolver";
import { deleteLead } from "../../../../services/lead/deleteLead";

/**
 * @swagger
 * /leads/{id}:
 *   delete:
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
 *     responses:
 *       200:
 *         description: Lead deleted
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error    
 */


export const leadDeleteSchema = Joi.object({
  id: Joi.string().trim().optional(),
}).unknown(true);

const router = Router();

router.delete("/:id", commonResolver.bind({ modelService: deleteLead, isRequestValidateRequired: true, schemaValidate: leadDeleteSchema }));

export default router;
