import Joi from "joi";
Joi.objectId = require('joi-objectid')(Joi);
import { createValidator } from "express-joi-validation";
const validator = createValidator({ passError: true });

import { loginSchema } from "../api/v1/web/auth/login";
import { registerSchema } from "../api/v1/web/auth/register";
import { forgotPasswordSchema } from "../api/v1/web/auth/forgotPassword";
import { resetPasswordSchema } from "../api/v1/web/auth/resetPassword";
import { profileSchema } from "../api/v1/web/auth/profile";
import { buyerSaveSchema } from "../api/v1/web/buyer/save";
import { buyerEditSchema } from "../api/v1/web/buyer/edit";
import { buyerListSchema } from "../api/v1/web/buyer/list";
import { buyerDeleteSchema } from "../api/v1/web/buyer/delete";
import { leadSaveSchema } from "../api/v1/web/lead/save";
import { leadEditSchema } from "../api/v1/web/lead/edit";
import { leadListSchema } from "../api/v1/web/lead/list";
import { leadSingleSchema } from "../api/v1/web/lead/single";
import { leadDeleteSchema } from "../api/v1/web/lead/delete";
import { importExcelSchema } from "../api/v1/web/lead/import";

module.exports = {
  Joi,
  validator,
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileSchema,
  buyerSaveSchema,
  buyerEditSchema,
  buyerListSchema,
  buyerDeleteSchema,
  leadSaveSchema,
  leadEditSchema,
  leadListSchema,
  leadSingleSchema,
  leadDeleteSchema,
  importExcelSchema,
};
