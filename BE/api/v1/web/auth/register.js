import { Router } from "express";
import Joi from "joi";
import commonResolver from "../../../../utilities/commonResolver";
import { register } from "../../../../services/auth/register";
import Message from "../../../../utilities/messages";

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register
 *     description: Register a new user.
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:        
 *             $ref: '#/components/schemas/Register'
 *     responses:
 *       200:
 *         description: Register successful.
 *       400:
 *         description: Invalid username, password, email or mobile number.
 */



export const registerSchema = Joi.object({
  username: Joi.string().trim().min(5).max(10).required().messages({
    "string.empty": Message.usernameRequired,
    "string.min": Message.usernameMinLength,
    "string.max": Message.usernameMaxLength,
    "any.required": Message.usernameRequired,
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": Message.passwordRequired,
    "string.min": Message.passwordMinLength,
    "any.required": Message.passwordRequired,
  }),
  email: Joi.string().email().trim().required().messages({
    "string.empty": Message.emailRequired,
    "string.email": Message.invalidEmail,
    "any.required": Message.emailRequired,
  }),
  mobilenumber: Joi.string().trim().pattern(/^\d{10}$/).required().messages({
    "string.empty": Message.mobileRequired,
    "string.pattern.base": Message.invalidMobile,
    "any.required": Message.mobileRequired,
  }),
});

const router = Router();

router.post("/register", commonResolver.bind({ modelService: register, isRequestValidateRequired: true, schemaValidate: registerSchema }));
router.post("/signup", commonResolver.bind({ modelService: register, isRequestValidateRequired: true, schemaValidate: registerSchema }));

export default router;
