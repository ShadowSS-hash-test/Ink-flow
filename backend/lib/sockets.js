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
    origin: ["http://localhost:5173", process.env.FRONTEND_URL],
    credentials: true,
  },
});

let roomData = new Map();
const MAX_USERS = 3;

// --- NEW: Helper to assign cursor colors ---
const generateColor = () => {
  const colors = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];
  return colors[Math.floor(Math.random() * colors.length)];
};

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

    // --- NEW: Listen for Cursor Movements ---
    // We don't save this to history to save RAM, just echo it to the room instantly
    socket.on("cursorMove", ({ x, y }) => {
        const { roomID } = socket;
        if (!roomID) return;
        socket.to(roomID).emit("cursorUpdate", { socketId: socket.id, x, y });
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
        const { roomID, username } = socket;
        
        if (!roomID || !roomData.has(roomID)) return; 
        
        const room = roomData.get(roomID);
        room.usernames.delete(username);
        
        // --- NEW: Clean up their cursor details ---
        room.userDetails.delete(socket.id); 

        console.log(`User ${username} left the room ${roomID}`);
        
        socket.to(roomID).emit("user-left", username);
        
        // --- NEW: Tell the frontend to delete this specific cursor ---
        socket.to(roomID).emit("cursor-left", socket.id);

        if(room.usernames.size === 0) {
            roomData.delete(roomID)
        } else {
            // Update the active cursors/colors for everyone else
            socket.to(roomID).emit("active-users", Array.from(room.userDetails.values()));
        }
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

        const clientsInRoom = io.sockets.adapter.rooms.get(roomID);
        const numClients = clientsInRoom ? clientsInRoom.size : 0;

        if (numClients >= MAX_USERS) {
            socket.emit("error", { message: "This room is currently full!" });
            return; 
        }

        socket.join(roomID);
        
        // Attach properties to socket for easy access later
        socket.username = user;   
        socket.roomID = roomID;
        const userColor = generateColor();

        if(!roomData.has(roomID)) {
            // --- NEW: Add userDetails map for cursor tracking ---
            const userDetails = new Map();
            userDetails.set(socket.id, { socketId: socket.id, username: user, color: userColor });

            roomData.set(roomID, {
                usernames: new Set([user]),
                history: [],
                userDetails: userDetails // Added this
            });

            socket.emit("active-users", Array.from(userDetails.values()));
        } else {
            const room = roomData.get(roomID);
            const { history, usernames, userDetails } = room;
             
            socket.emit('replay', history);
             
          
            socket.emit('user-list', Array.from(usernames)); 
             
            usernames.add(user);
            userDetails.set(socket.id, { socketId: socket.id, username: user, color: userColor });

            console.log(`User ${user} joined the room ${roomID}`);
            
           
            socket.to(roomID).emit("user-joined", user);

            io.to(roomID).emit("active-users", Array.from(userDetails.values()));
        }
    })
})

export {io,server,app}