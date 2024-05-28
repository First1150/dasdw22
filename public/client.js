const socket = io(); // เชื่อมต่อกับเซิร์ฟเวอร์ Socket.IO

socket.on('connect', () => {
    console.log('Connected to the server');
});

// สร้างรหัสห้องและรหัสผู้ใช้
let roomId;
let userId;

// ฟังก์ชันสำหรับสร้างห้องใหม่และเข้าร่วมห้องทันที
function createAndJoinRoom() {
    const userId = prompt('Enter your user ID:');
    const roomName = prompt('Enter the room name:');
    socket.emit('create-and-join-room', userId, roomName);
}

socket.on('room-created', (roomId) => {
    // เมื่อได้รหัสห้องก็ทำการเข้าร่วมห้อง
    joinRoom(roomId);
});

function joinRoom(roomId) {
    const userId = prompt('Enter your user ID:');
    socket.emit('join-room', roomId, userId);
}

// ส่วนอื่นๆ เช่นการรับข้อความแชท ส่งข้อความ และเชื่อมต่อกับ HTML คงไม่ต้องเปลี่ยนแปลง





// รับข้อความแชทและแสดงบนหน้าเว็บ
socket.on('chat-message', ({ userId, msg }) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${userId}: ${msg}`;
    document.getElementById('chat-display').appendChild(messageElement);
});

// เชื่อมต่อฟังก์ชัน joinRoom() กับปุ่ม "Join Room"
document.getElementById('join-room-button').addEventListener('click', joinRoom);

// เชื่อมต่อฟังก์ชัน createRoom() กับปุ่ม "Create Room"
document.getElementById('create-room-button').addEventListener('click', createAndJoinRoom);

// เชื่อมต่อฟังก์ชันสำหรับส่งข้อความแชท กับปุ่ม "Send"
document.getElementById('send-button').addEventListener('click', () => {
    const message = document.getElementById('message-input').value;
    if (message.trim()) {
        socket.emit('chat-message', roomId, userId, message);
        document.getElementById('message-input').value = '';
    }
});
