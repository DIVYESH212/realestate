import { Router } from 'express';
import commonResolver from '../../../../utilities/commonResolver';
import { createFolder } from '../../../../services/drive';

const router = Router();

router.post('/create-folder', commonResolver.bind({ modelService: createFolder }));

export default router;
