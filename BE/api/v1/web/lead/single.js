import { Router } from "express";
import Joi from "joi";
import commonResolver from "../../../../utilities/commonResolver";
import { getLeadById } from "../../../../services/lead/getLeadById";

/**
 * @swagger
 * /leads/{id}:
 *   get:
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
 *         description: Lead found
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error   
 */ 

export const leadSingleSchema = Joi.object({
  id: Joi.string().trim().optional(),
}).unknown(true);

const router = Router();

router.get("/:id", commonResolver.bind({ modelService: getLeadById, isRequestValidateRequired: true, schemaValidate: leadSingleSchema }));

export default router;
