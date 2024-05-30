const socket = io();
let roomId;
let userId;

document.getElementById('join-room-button').addEventListener('click', () => {
    document.getElementById('home-page').style.display = 'none';
    document.getElementById('room-selection-page').style.display = 'block';
});

document.getElementById('create-room-button').addEventListener('click', () => {
    createRoom();
});

function createRoom() {
    const roomName = prompt('Enter room name:');
    if (roomName) {
        socket.emit('create-room', roomName);
    }
}

socket.on('room-created', ({ roomId, roomName }) => {
    const roomButton = document.createElement('button');
    roomButton.textContent = roomName;
    roomButton.addEventListener('click', () => {
        joinRoom(roomId);
    });
    document.getElementById('existing-rooms').appendChild(roomButton);
});

document.getElementById('enter-room-button').addEventListener('click', () => {
    const userName = document.getElementById('user-name').value;
    const roomName = document.getElementById('room-name').value;
    if (userName.trim() && roomName.trim()) {
        userId = userName;
        joinRoom(roomName);
    }
});

function joinRoom(roomName) {
    roomId = roomName; // Just for the sake of this example, you might need a better way to handle roomIds
    socket.emit('join-room', roomId, userId);
}

socket.on('join-room', () => {
    document.getElementById('room-selection-page').style.display = 'none';
    document.getElementById('chat-room-section').style.display = 'block';
});

document.getElementById('send-button').addEventListener('click', () => {
    const message = document.getElementById('message-input').value;
    if (message.trim()) {
        socket.emit('chat-message', roomId, userId, message);
        document.getElementById('message-input').value = '';
    }
});

socket.on('chat-message', ({ userId, msg }) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${userId}: ${msg}`;
    document.getElementById('chat-display').appendChild(messageElement);
});
