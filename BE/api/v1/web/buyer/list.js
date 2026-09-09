import { Router } from "express";
import Joi from "joi";
import commonResolver from "../../../../utilities/commonResolver";
import { getbuyer } from "../../../../services/buyer/getBuyer";

/**
 * @swagger
 * /buyer/list:
 *   get:
 *     summary: List Buyer
 *     description: List all buyers.
 *     tags: [Buyer]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         required: false
 *         description: Page number.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         required: false
 *         description: Limit number.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search keyword.
 *     responses:
 *       200:
 *         description: List buyer successful.
 *       500: 
 *         description: Internal server error.  
 */

export const buyerListSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
  search: Joi.string().optional().allow('', null),
}).unknown(true);

const router = Router();

router.post("/search", commonResolver.bind({ modelService: getbuyer, isRequestValidateRequired: true, schemaValidate: buyerListSchema }));
router.get("/", commonResolver.bind({ modelService: getbuyer, isRequestValidateRequired: true, schemaValidate: buyerListSchema }));

export default router;
