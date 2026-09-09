import { Router } from "express";
import commonResolver from "../../../../utilities/commonResolver";
import { deleteEmail } from "../../../../services/email";

const router = Router();

router.delete(
  "/:id",
  commonResolver.bind({
    modelService: deleteEmail,
    isRequestValidateRequired: false
  })
);

export default router;
