import express from "express";
import {createBoard, fetchBoards} from "../controllers/drawingControllers.js"
import { verifyToken } from "../middlewares/Auth.middlewares.js";


const router = express.Router()
router.post('/createBoard',verifyToken,createBoard)
router.get('/fetchBoards',verifyToken,fetchBoards)


export default router;