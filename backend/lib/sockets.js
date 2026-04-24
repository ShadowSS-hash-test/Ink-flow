import express from "express"
import http from "http"
import { Server } from "socket.io"
import dotenv from "dotenv"
import { nanoid } from "nanoid"

dotenv.config()

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

let roomData = new Map();



io.on("connection", (socket)=>{
    console.log("A user connected")
    console.log(socket.id)

    socket.on("drawing", (drawData) => {
         const { roomID } = socket;
         if (!roomID || !roomData.has(roomID)) {
            return socket.emit("error", { message: "Room not found or you are not in a room." });
  }

        socket.to(roomID).emit("drawing", drawData);
        roomData.get(roomID).history.push(drawData);
});

 socket.on('clearCanvas',()=>{
   const { roomID } = socket;

   if (!roomID || !roomData.has(roomID)) {
    return socket.emit("error", { message: "Room not found or you are not in a room." });
  }

   socket.to(roomID).emit("clearCanvas")
   roomData.get(roomID).history.length = 0;

 })

 socket.on("disconnect", () => {
  
    console.log("A user disconnected", socket.id);
    const { roomID,username } = socket;
     if (!roomID || !roomData.has(roomID)) return; 
    roomData.get(roomID).usernames.delete(username);
      console.log(`User ${username} left the room ${roomID}`);
    socket.to(roomID).emit("user-left", username);

    if(roomData.get(roomID).usernames.size === 0)
      roomData.delete(roomID)


  });

  socket.on("joinRoom",({roomID,user})=>{

     if (roomID !== "create" && !roomData.has(roomID)) {
    return socket.emit("error", { message: "Room does not exist." });
  }
  

    if(roomID === "create"){
       roomID = nanoid();
       console.log("Created a room with the id:  ", roomID)
        socket.emit("roomCreated", roomID); 
    }
      
    socket.join(roomID);
   

   if(!roomData.has(roomID))
    roomData.set(roomID, {usernames: new Set([user]),history:[]});


   else{
      
    const {history} = roomData.get(roomID);
     socket.emit('replay',history)
     socket.emit('user-list',roomData.usernames)
     roomData.get(roomID).usernames.add(user)
     console.log(`User ${user} joined the room ${roomID}`);
     socket.to(roomID).emit("user-joined", user);

   }

   socket.username = user;   
  socket.roomID = roomID;

  })


})





export {io,server,app}