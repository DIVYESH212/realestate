import { Router } from "express";
import Joi from "joi";
import commonResolver from "../../../../utilities/commonResolver";
import { resetPassword } from "../../../../services/auth/resetPassword";
import Message from "../../../../utilities/messages";

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset Password
 *     description: Reset password of the user.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPassword'
 *     responses:
 *       200:
 *         description: Reset password successful.
 *       400:
 *         description: Invalid token or password.
 */

export const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    "string.empty": Message.tokenRequired,
    "any.required": Message.tokenRequired,
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": Message.passwordRequired,
    "string.min": Message.passwordMinLength,
    "any.required": Message.passwordRequired,
  }),
});

const router = Router();

router.post("/reset-password", commonResolver.bind({ modelService: resetPassword, isRequestValidateRequired: true, schemaValidate: resetPasswordSchema }));

export default router;
