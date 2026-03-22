import { signup,signin,logout,refreshToken } from "../controllers/authControllers.js";
import { verifyToken } from "../middlewares/Auth.middlewares.js";
import express from "express";

const router = express.Router()


router.post('/signup',signup)
router.post('/signin',signin)
router.get('/profile',verifyToken,(req,res)=>{
    return res.status(200).json({
        message:"Welcome User!"
    })
})
router.get('/logout',verifyToken,logout)

export default router;

