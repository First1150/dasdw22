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
    socket.on('create-room', (userId) => {
        const roomId = uuidv4(); // สร้างรหัสห้องใหม่โดยใช้ uuid
        socket.join(roomId); // เข้าร่วมห้องใหม่ทันที
        
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(userId); // เพิ่มผู้ใช้ที่สร้างห้องเข้าไปในเซ็ตของผู้ใช้ในห้อง
        
        // ส่งรหัสห้องกลับไปยังผู้ใช้ที่สร้างห้อง
        socket.emit('room-created', roomId);
        
        // ส่งข้อความยินดีให้ผู้ใช้ทุกคนในห้องใหม่ทราบว่ามีผู้ใช้เข้าร่วม
        socket.to(roomId).emit('chat-message', { userId: 'system', msg: `User ${userId} has created and joined the room.` });
    });
    
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        // เก็บ userId ในห้อง
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(userId);
        // ส่งข้อความยินดีเข้าร่วมห้อง
        socket.to(roomId).emit('chat-message', { userId: 'system', msg: `User ${userId} has joined the room.` });
    });

    socket.on('chat-message', (roomId, userId, msg) => {
        // ส่งข้อความให้ผู้ใช้ในห้องแชท
        socket.to(roomId).emit('chat-message', { userId, msg });
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
