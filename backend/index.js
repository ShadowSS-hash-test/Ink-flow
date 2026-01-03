import express from "express"
import dotenv from "dotenv"
import {app,server} from "./lib/sockets.js"
import cors from "cors"
import sql from "./util/db.js"


app.use(express.json());


dotenv.config();
const PORT = process.env.PORT || 5000;


server.listen(PORT, async() => {
  console.log("Server running on port: " + PORT);

  try {
    const res = await sql.query('SELECT NOW()');
    console.log('Database check successful:', res.rows[0]);
  } catch (err) {
    console.error('Database check failed', err);
  }

 
});