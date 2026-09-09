import { Router } from "express";
import Joi from "joi";
import commonResolver from "../../../../utilities/commonResolver";
import { forgotPassword } from "../../../../services/auth/forgotPassword";
import Message from "../../../../utilities/messages";


/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot Password
 *     description: Sends a forgot password email to the user.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email address of the user.
 *                 example: user@example.com
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Forgot password email sent successfully.
 *       400:
 *         description: Invalid email address.       
 */


export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().trim().required().messages({
    "string.empty": Message.emailRequired,
    "string.email": Message.invalidEmail,
    "any.required": Message.emailRequired,
  }),
});

const router = Router();

router.post("/forgot-password", commonResolver.bind({ modelService: forgotPassword, isRequestValidateRequired: true, schemaValidate: forgotPasswordSchema }));

export default router;
