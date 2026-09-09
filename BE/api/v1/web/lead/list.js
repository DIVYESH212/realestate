import { Router } from "express";
import Joi from "joi";
import commonResolver from "../../../../utilities/commonResolver";
import { getLeads } from "../../../../services/lead/getLeads";

/**
 * @swagger
 * /leads/search:
 *   post:
 *     tags: [Lead]
 *     security:
 *       - bearerAuth: []
 *     summary: Search leads
 *     description: Search leads
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:        
 *             $ref: '#/components/schemas/Lead'
 *     responses:
 *       200:
 *         description: Leads found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lead'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:        
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:        
 *               $ref: '#/components/schemas/Error'     
 */

/**
 * @swagger
 * /leads:
 *   get: 
 *     tags: [Lead]
 *     security:
 *       - bearerAuth: []
 *     summary: List leads
 *     description: List leads
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         required: false
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         required: false
 *         description: Limit number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search keyword
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: false
 *         description: Status of the lead
 *     responses:
 *       200:
 *         description: Leads found
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error    
 */

export const leadListSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional().allow('', null),
  status: Joi.string().optional().allow('', null),
}).unknown(true);

const router = Router();

router.post("/search", commonResolver.bind({ modelService: getLeads, isRequestValidateRequired: true, schemaValidate: leadListSchema }));
router.get("/", commonResolver.bind({ modelService: getLeads, isRequestValidateRequired: true, schemaValidate: leadListSchema }));

export default router;
