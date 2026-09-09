import { Router } from "express";
import Joi from "joi";
import commonResolver from "../../../../utilities/commonResolver";
import { deleteBuyer } from "../../../../services/buyer/deleteBuyer";
import Message from "../../../../utilities/messages";


/**
 * @swagger
 * /buyer/{id}:
 *   delete:
 *     summary: Delete Buyer
 *     description: Delete a buyer.
 *     tags: [Buyer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the buyer.
 *     responses:
 *       200:
 *         description: Delete buyer successful.
 *       400:
 *         description: Invalid ID.
 */


export const buyerDeleteSchema = Joi.object({
  id: Joi.string().trim().required().messages({
    "string.empty": Message.idRequired,
    "any.required": Message.idRequired,
  }),
}).unknown(true);



const router = Router();

router.delete("/:id", commonResolver.bind({ modelService: deleteBuyer, isRequestValidateRequired: true, schemaValidate: buyerDeleteSchema }));

export default router;
