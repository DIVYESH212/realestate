import { Router } from 'express';
import commonResolver from '../../../../utilities/commonResolver';
import { getTrashItems, restoreItem, hardDeleteItem, emptyTrash } from '../../../../services/drive';

const router = Router();

router.get('/trash', commonResolver.bind({ modelService: getTrashItems }));
router.post('/trash/restore/:id', commonResolver.bind({ modelService: restoreItem }));
router.delete('/trash/empty', commonResolver.bind({ modelService: emptyTrash }));
router.delete('/trash/:id', commonResolver.bind({ modelService: hardDeleteItem }));

export default router;
