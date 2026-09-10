import { Router } from "express";
import Joi from "joi";
import commonResolver from "../../../../utilities/commonResolver";
import { refreshTokenService } from "../../../../services/auth/refreshToken";

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh Access Token
 *     description: Refreshes access token using a valid refresh token from JSON body or HttpOnly cookie.
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token (optional if sent via HttpOnly cookie).
 *     responses:
 *       200:
 *         description: Token refreshed successfully.
 *       400:
 *         description: Invalid or expired refresh token.
 */

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().trim().optional().allow(""),
});

const router = Router();

router.post(
  "/refresh-token",
  commonResolver.bind({
    modelService: refreshTokenService,
    isRequestValidateRequired: false,
    schemaValidate: refreshTokenSchema,
  })
);

export default router;
