import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import { getRandomProfiles, handleSwipe } from '../controller/swipe.controller.js';

const router = express.Router();

router.use(isAuthenticated);

router.get("/profiles", getRandomProfiles);

// Like ya Dislike karne ke liye
router.post("/action", handleSwipe);

export default router;