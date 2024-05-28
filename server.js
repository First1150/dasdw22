const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000;

// ข้อมูลเก็บรายชื่อห้องแชทและผู้ใช้ในแต่ละห้อง
const rooms = new Map();

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('create-and-join-room', (userId, roomName) => {
        const roomId = uuidv4(); // สร้างรหัสห้องใหม่โดยใช้ uuid
        socket.join(roomId); // เข้าร่วมห้องใหม่ทันที
        
        // สร้างข้อมูลห้องและผู้ใช้
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Map());
        }
        rooms.get(roomId).set(userId, roomName); // เพิ่มผู้ใช้และชื่อห้องเข้าไปใน Map ของห้อง
        
        // ส่งรหัสห้องกลับไปยังผู้ใช้ที่สร้างห้อง
        socket.emit('room-created', roomId);
        
        // ส่งข้อความยินดีให้ผู้ใช้ทุกคนในห้องใหม่ทราบว่ามีผู้ใช้เข้าร่วม
        io.to(roomId).emit('chat-message', { userId: 'system', msg: `User ${userId} has created and joined the room.` });
    });
    
    
    
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        // เก็บ userId และชื่อห้อง
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Map());
        }
        const roomName = rooms.get(roomId).get(userId);
        
        // ส่งข้อความยินดีเข้าร่วมห้อง
        socket.to(roomId).emit('chat-message', { userId: 'system', msg: `User ${userId} has joined the room ${roomName}.` });
    });
    

    socket.on('chat-message', (roomId, userId, msg) => {
        // ส่งข้อความให้ผู้ใช้ในห้องแชท
        socket.to(roomId).emit('chat-message', { userId, msg }); // ส่งถึงผู้ในห้องยกเว้นตัวเอง
        socket.emit('chat-message', { userId, msg }); // ส่งข้อความกลับไปยังผู้ส่งเองด้วย
    });
    

    socket.on('disconnect', () => {
        // ออกจากห้องแชทที่เคยเข้าร่วม
        rooms.forEach((users, roomId) => {
            if (users.has(socket.userId)) {
                users.delete(socket.userId);
                // ส่งข้อความออกจากห้องแชท
                socket.to(roomId).emit('chat-message', { userId: 'system', msg: `User ${socket.userId} has left the room.` });
            }
        });
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
