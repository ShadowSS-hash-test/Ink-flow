import express from "express";
import {createBoard, fetchBoards, updateBoard,deleteBoard} from "../controllers/drawingControllers.js"
import { verifyToken } from "../middlewares/Auth.middlewares.js";


const router = express.Router()
router.post('/createBoard',verifyToken,createBoard)
router.get('/fetchBoards',verifyToken,fetchBoards)
router.post('/updateBoard',verifyToken,updateBoard)
router.delete('/:boardId', verifyToken, deleteBoard);


export default router; 