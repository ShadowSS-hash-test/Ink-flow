import express from "express"
import http from "http"
import { Server } from "socket.io"
import dotenv from "dotenv"

dotenv.config()

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});


io.on("connection", (socket)=>{
    console.log("A user connected")
    console.log(socket.id)

    socket.on("drawing", (drawData) => {


        socket.broadcast.emit("drawing", drawData);
});

 socket.on('clearCanvas',()=>{
   socket.broadcast.emit("clearCanvas")
 })

 socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
  });


})





export {io,server,app}