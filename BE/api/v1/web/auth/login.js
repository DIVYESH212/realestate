import { Router } from "express";
import Joi from "joi";
import commonResolver from "../../../../utilities/commonResolver";
import { login } from "../../../../services/auth/login";
import Message from "../../../../utilities/messages";

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     description: Logs in a user.
 *     tags: [Auth]
 *     requestBody: 
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username of the user.
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: Password of the user.
 *                 example: password
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Login successful.
 *       400:
 *         description: Invalid username or password. 
 */



export const loginSchema = Joi.object({
  username: Joi.string().trim().required().messages({
    "string.empty": Message.usernameRequired,
    "any.required": Message.usernameRequired,
  }),
  password: Joi.string().required().messages({
    "string.empty": Message.passwordRequired,
    "any.required": Message.passwordRequired,
  }),
});

const router = Router();

router.post("/login", commonResolver.bind({ modelService: login, isRequestValidateRequired: true, schemaValidate: loginSchema }));

export default router;
