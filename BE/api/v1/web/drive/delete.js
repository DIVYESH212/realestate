import { Router } from 'express';
import commonResolver from '../../../../utilities/commonResolver';
import { deleteItem } from '../../../../services/drive';

const router = Router();

router.delete('/items/:id', commonResolver.bind({ modelService: deleteItem }));

export default router;
