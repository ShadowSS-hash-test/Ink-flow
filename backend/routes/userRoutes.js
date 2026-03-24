import express from "express";
import { deleteAccount, updatePassword, updateProfile } from "../controllers/userControllers.js";
import { verifyToken } from "../middlewares/Auth.middlewares.js";


const router = express.Router()

router.post('/updateProfile',verifyToken,updateProfile)
router.post('/updatePassword',verifyToken,updatePassword)
router.post('/deleteAccount',verifyToken,deleteAccount)





export default router;