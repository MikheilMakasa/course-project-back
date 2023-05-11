import express from 'express';
import {
  getUsers,
  makeAdmin,
  deleteUser,
  unmakeAdmin,
} from '../controllers/user.js';

const router = express.Router();

router.get('/', getUsers);
router.post('/makeAdmin', makeAdmin);
router.post('/unmakeAdmin', unmakeAdmin);
router.post('/deleteUser', deleteUser);

export default router;
