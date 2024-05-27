const socket = io(); // เชื่อมต่อกับเซิร์ฟเวอร์ Socket.IO

socket.on('connect', () => {
    console.log('Connected to the server');
});

// สร้างรหัสห้องและรหัสผู้ใช้
let roomId;
let userId;

// ฟังก์ชันสำหรับเข้าร่วมห้อง
function joinRoom() {
    roomId = prompt('Enter room ID:');
    userId = prompt('Enter your user ID:');
    socket.emit('join-room', roomId, userId);
}

// ฟังก์ชันสำหรับสร้างห้องใหม่
function createRoom() {
    const userId = prompt('Enter your user ID:');
    socket.emit('create-room', userId);
    // เพิ่มการเข้าร่วมห้องทันทีหลังจากสร้างห้อง
    socket.join(roomId);
    
    // ส่งข้อความยินดีเข้าร่วมห้อง
    socket.to(roomId).emit('chat-message', { userId: 'system', msg: `User ${userId} has created and joined the room.` });
}


// รับข้อความแชทและแสดงบนหน้าเว็บ
socket.on('chat-message', ({ userId, msg }) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${userId}: ${msg}`;
    document.getElementById('chat-display').appendChild(messageElement);
});

// เชื่อมต่อฟังก์ชัน joinRoom() กับปุ่ม "Join Room"
document.getElementById('join-room-button').addEventListener('click', joinRoom);

// เชื่อมต่อฟังก์ชัน createRoom() กับปุ่ม "Create Room"
document.getElementById('create-room-button').addEventListener('click', createRoom);

// เชื่อมต่อฟังก์ชันสำหรับส่งข้อความแชท กับปุ่ม "Send"
document.getElementById('send-button').addEventListener('click', () => {
    const message = document.getElementById('message-input').value;
    if (message.trim()) {
        socket.emit('chat-message', roomId, userId, message);
        document.getElementById('message-input').value = '';
    }
});
