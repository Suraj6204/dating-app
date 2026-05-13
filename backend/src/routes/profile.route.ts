import {Router} from "express"
import { getMyProfile, updateProfile } from "../controller/profile.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = Router();

router.use(isAuthenticated);

router.post('/update' , updateProfile);
router.get('/me' , getMyProfile);

export default router; 