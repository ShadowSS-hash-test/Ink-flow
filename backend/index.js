import express from "express"
import dotenv from "dotenv"
import {app,server} from "./lib/sockets.js"


app.use(express.json());


dotenv.config();
const PORT = process.env.PORT || 5000;


server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
 
});