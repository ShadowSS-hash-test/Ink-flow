import express from "express";
import { updatePassword, updateProfile } from "../controllers/userControllers.js";
import { verifyToken } from "../middlewares/Auth.middlewares.js";


const router = express.Router()

router.post('/updateProfile',verifyToken,updateProfile)
router.post('/updatePassword',verifyToken,updatePassword)





export default router;