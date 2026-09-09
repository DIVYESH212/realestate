import { Router } from 'express';
import commonResolver from '../../../../utilities/commonResolver';
import { getItems } from '../../../../services/drive';

const router = Router();

router.get('/items', commonResolver.bind({ modelService: getItems }));
router.get('/', commonResolver.bind({ modelService: getItems }));

export default router;
