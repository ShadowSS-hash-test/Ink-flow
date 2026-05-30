import { signup,signin,logout,refreshToken,getProfile } from "../controllers/authControllers.js";
import { verifyToken } from "../middlewares/Auth.middlewares.js";
import express from "express";

const router = express.Router()


router.post('/signup',signup)
router.post('/signin',signin)
router.get('/profile',verifyToken,getProfile)
router.get('/logout',verifyToken,logout)
router.post('/refresh-token',refreshToken)

export default router;

