import { Router } from 'express';
import commonResolver from '../../../../utilities/commonResolver';
import { renameItem } from '../../../../services/drive';

const router = Router();

router.patch('/items/:id/rename', commonResolver.bind({ modelService: renameItem }));

export default router;
