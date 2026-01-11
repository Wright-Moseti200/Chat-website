let http = require("http");
let express = require("express");
let app = express();
let server = http.createServer(app)
let {Server} = require("socket.io");
let cors = require("cors");
let io = new Server(server,{
    cors:{
        origin:"http://localhost:5173",
    }
});
let port = 4000;
app.use(cors({
    origin:"http://localhost:5173",
}));

app.get("/",(req,res)=>{
res.send("Express server is running");
});

const roomUsers = new Map();

io.on("connection",(socket)=>{
    console.log("User is connected");
    socket.username = "anonymous";
    
    socket.on("join-room&add-username",(room,username)=>{
        // Leave all previous rooms and notify those rooms
        socket.rooms.forEach((element)=>{
            if(element !== socket.id){
                if(roomUsers.has(element)){
                    roomUsers.get(element).delete(socket.id);
                    
                    const users = Array.from(roomUsers.get(element).values());
                    
                    // Notify OTHERS in old room (using OLD username)
                    socket.to(element).emit("user-left",{
                        username: socket.username,
                        message: `${socket.username} has left ${element}`,
                        users: users
                    });
                    
                    socket.leave(element);
                    
                    // Clean up empty rooms
                    if(roomUsers.get(element).size === 0){
                        roomUsers.delete(element);
                    }
                }
            }
        });
        
        // Update username AFTER leaving old rooms
        socket.username = username || "Anonymous";
        
        // Join new room
        socket.join(room);
        
        // Add user to room's Map
        if(!roomUsers.has(room)){
            roomUsers.set(room, new Map());
        }
        roomUsers.get(room).set(socket.id, socket.username);
        
        // Get all users in the room
        let users = Array.from(roomUsers.get(room).values());
        
        // Notify others in the room
        socket.to(room).emit("user-joined",{
            username: socket.username,
            message: `${socket.username} has joined ${room}`,
            users: users
        });
        
        // Confirm to the user they joined
        socket.emit("joined-room",{
            room: room,
            username: socket.username,
            message: `You joined ${room}`,
            users: users
        });
        
        console.log(`${socket.username} joined room: ${room}`);
        console.log(`Users in ${room}:`, users);
    });

    socket.on("leave-room",(room)=>{
        socket.leave(room);
        
        if(roomUsers.has(room)){
            roomUsers.get(room).delete(socket.id);
            const users = Array.from(roomUsers.get(room).values());
            
            // Notify others
            socket.to(room).emit("user-left",{
                username: socket.username,
                message: `${socket.username} has left the room`,
                users: users
            });
            
            // Clean up empty rooms
            if(roomUsers.get(room).size === 0){
                roomUsers.delete(room);
            }
        }
        
        // Confirm to the user they left
        socket.emit("left-room",{
            room: room,
            message: `You left ${room}`
        });
        
        console.log(`${socket.username} left room: ${room}`);
    });

    socket.on("send-message",(room, msg)=>{
        io.to(room).emit("messages",{
            message: msg,
            timestamp: Date.now(),  // Fixed typo
            username: socket.username
        });
    });
    
    socket.on("disconnect",()=>{  // No room parameter!
        console.log(`${socket.username} disconnected`);
        
        // Loop through all rooms the user was in
        socket.rooms.forEach((room)=>{
            if(room !== socket.id){
                if(roomUsers.has(room)){
                    roomUsers.get(room).delete(socket.id);
                    
                    const users = Array.from(roomUsers.get(room).values());
                    
                    // Notify others in that room
                    socket.to(room).emit("user-left",{
                        username: socket.username,
                        message: `${socket.username} has disconnected`,
                        users: users
                    });
                    
                    // Clean up empty rooms
                    if(roomUsers.get(room).size === 0){
                        roomUsers.delete(room);
                    }
                }
            }
        });
    });
});

server.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});