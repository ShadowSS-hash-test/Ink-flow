import express from "express"
import dotenv from "dotenv"
import {app,server} from "./lib/sockets.js"
import cors from "cors"
import sql from "./util/db.js"
import initDB from "./util/initDB.js"
import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import drawingRoutes from "./routes/drawingRoutes.js"
import cookieParser from "cookie-parser"

dotenv.config();

app.use(cors({
    origin: ['http://localhost:5173', process.env.FRONTEND_URL], 
    credentials: true,               
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));



app.use(express.json());
app.use(cookieParser())

app.use('/api/auth',authRoutes)
app.use('/api/user',userRoutes)
app.use('/api/drawings',drawingRoutes)




const PORT = process.env.PORT || 5000;
 

server.listen(PORT, async() => {
  console.log("Server running on port: " + PORT);

 

  try {
    const res = await sql.query('SELECT NOW()');
    console.log('Database check successful:', res.rows[0]);
    initDB()
  } catch (err) {
    console.error('Database check failed', err);
  }

 
});