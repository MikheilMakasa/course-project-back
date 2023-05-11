import express from 'express';
import {
  getUsers,
  blockUser,
  deleteUser,
  unblockUser,
} from '../controllers/user.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/blockUser', blockUser);
router.post('/unblockUser', unblockUser);
router.delete('/deleteUser', deleteUser);

export default router;
