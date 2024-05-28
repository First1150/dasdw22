const socket = io();

socket.on('connect', () => {
    console.log('Connected to the server');
});

let roomId; // รหัสห้อง
let userId; // รหัสผู้ใช้

function joinRoom(roomId) {
    userId = prompt('Enter your user ID:');
    socket.emit('join-room', roomId, userId);
}

function createRoom() {
    const roomName = prompt('Enter room name:');
    if (roomName) {
        socket.emit('create-room', roomName);
    }
}

socket.on('chat-message', ({ userId, msg }) => {
    const messageElement = document.createElement('div');
    if (userId === userId) {
        messageElement.textContent = `You: ${msg}`;
    } else {
        messageElement.textContent = `${userId}: ${msg}`;
    }
    document.getElementById('chat-display').appendChild(messageElement);
});


socket.on('room-created', ({ roomId, roomName }) => {
    const roomButton = document.createElement('button');
    roomButton.textContent = roomName;
    roomButton.addEventListener('click', () => {
        joinRoom(roomId);
    });
    document.getElementById('room-selection').appendChild(roomButton);
});

document.getElementById('join-room-button').addEventListener('click', () => {
    roomId = prompt('Enter room ID:');
    joinRoom(roomId);
});

document.getElementById('create-room-button').addEventListener('click', createRoom);

document.getElementById('send-button').addEventListener('click', () => {
    const message = document.getElementById('message-input').value;
    if (message.trim()) {
        socket.emit('chat-message', roomId, userId, message);
        document.getElementById('message-input').value = '';
    }
});

// ส่วนนี้เพิ่มการรับข้อความจากผู้ใช้และส่งไปยังเซิร์ฟเวอร์
document.getElementById('message-input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const message = document.getElementById('message-input').value;
        if (message.trim()) {
            socket.emit('chat-message', roomId, userId, message);
            document.getElementById('message-input').value = '';
        }
    }
});
