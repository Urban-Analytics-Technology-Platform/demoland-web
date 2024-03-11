import { writable } from 'svelte/store';

const messageStore = writable('');

const socket = new WebSocket('ws://localhost:8000/ws');

// Connection opened
socket.addEventListener('open', function(event) {
  socket.send(JSON.stringify(message));
  console.log("Connected");
});

// Listen for messages
socket.addEventListener('message', function(event) {
  console.log("got message ", event.data)
  const message = JSON.parse(event.data)
  messageStore.set(message);
});


const sendMessage = (message) => {
  console.log("sending message", message)
  if (socket.readyState <= 1) {
    socket.send(JSON.stringify(message));
  }
}

export default {
  subscribe: messageStore.subscribe,
  sendMessage
}


