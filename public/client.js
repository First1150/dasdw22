const socket = io();

socket.on('connect', () => {
    console.log('Connected to the server');
});

let roomId; // รหัสห้อง
let userId; // รหัสผู้ใช้

function joinRoom() {
    roomId = prompt('Enter room ID:');
    userId = prompt('Enter your user ID:');
    socket.emit('join-room', roomId, userId);
}

socket.on('chat-message', ({ userId, msg }) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${userId}: ${msg}`;
    document.getElementById('chat-display').appendChild(messageElement);
});

document.getElementById('join-room-button').addEventListener('click', joinRoom);

document.getElementById('send-button').addEventListener('click', () => {
    const message = document.getElementById('message-input').value;
    if (message.trim()) {
        socket.emit('chat-message', roomId, userId, message);
        document.getElementById('message-input').value = '';
    }
});
