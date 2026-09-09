import { Router } from "express";
import commonResolver from "../../../../utilities/commonResolver";
import { getStages } from "../../../../services/stage/getStages";

const router = Router();

router.get("/", commonResolver.bind({ modelService: getStages, isRequestValidateRequired: false }));

export default router;
