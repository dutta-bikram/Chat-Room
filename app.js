// dependencies
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const formatMessage = require('./utils/messages');
const {
   userJoin,
   getCurrentUser,
   userLeave,
   getRoomUsers,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// set static file
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Chat-Room Bot';

// run when client connects
io.on('connection', (socket) => {
   socket.on('joinRoom', ({ username, room }) => {
      const user = userJoin(socket.id, username, room);

      socket.join(user.room);

      // welcome current user
      socket.emit('message', formatMessage(botName, 'Welcome to Chat-Room!',true));

      // broadcast when a user connects
      socket.broadcast
         .to(user.room)
         .emit(
            'message',
            formatMessage(botName, `<strong>${user.username}</strong> has joined the chat!`, true)
         );

      // send users and room info
      io.to(user.room).emit('roomUsers', {
         room: user.room,
         users: getRoomUsers(user.room),
      });
   });

   // listen for chatMessage
   socket.on('chatMessage', (msg) => {
      const user = getCurrentUser(socket.id);

      io.to(user.room).emit('message', formatMessage(user.username, msg,false));
   });

   // runs when clients disconnects
   socket.on('disconnect', () => {
      const user = userLeave(socket.id);

      if (user) {
         io.to(user.room).emit(
            'message',
            formatMessage(botName, `<strong>${user.username}</strong> has left the chat!`, true)
         );

         // send users and room info
         io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room),
         });
      }
   });
});

//port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
   console.log(`🎯 Server is running on PORT: ${PORT}`);
});
