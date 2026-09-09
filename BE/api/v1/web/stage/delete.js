import { Router } from "express";
import commonResolver from "../../../../utilities/commonResolver";
import { deleteStage } from "../../../../services/stage/deleteStage";

const router = Router();

router.delete("/:id", commonResolver.bind({ modelService: deleteStage, isRequestValidateRequired: false }));

export default router;
