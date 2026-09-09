import { Router } from "express";
import Joi from "joi";
import commonResolver from "../../../../utilities/commonResolver";
import { decodeJwtTokenFn } from "../../../../utilities/universal";
import { getProfile } from "../../../../services/auth/getProfile";


    /**
     * @swagger
     * /auth/profile:
     *   get:
     *     summary: Get Profile
     *     description: Get profile of the user.
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Get profile successful.
     *       500:
     *         description: Internal server error.  
     */ 

export const profileSchema = Joi.object({}).unknown(true);

const router = Router();

router.get("/profile", decodeJwtTokenFn, commonResolver.bind({ modelService: getProfile, isRequestValidateRequired: true, schemaValidate: profileSchema }));

export default router;
