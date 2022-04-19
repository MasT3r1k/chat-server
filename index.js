const express = require('express');
const app = express();
const server = app.listen(3000);

const flash = require('connect-flash');

const io = require('socket.io')(server, {   cors: {
    origin: '*',
  }});
const db = require('./db');
const auth = require('./functions/AuthBase');
const chat = require('./functions/chat');
const cors = require('cors');

const language = require('./functions/language');
const cookieParser = require('cookie-parser');


const socketsStatus = {}; // voice status

app.set('Access-Control-Allow-Origin', 'localhost:4200')

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('join', (data) => {
        console.log('join', data);
        socket.join(data.channelid);
        socketsStatus[data.channelid] = true;
    });

    socket.on('leave', (data) => {
        console.log('leave', data);
        socket.leave(data.channelid);
        socketsStatus[data.channelid] = false;
    });

    socket.on('message', (data) => {
        console.log('message', data);
        io.to(data.channelid).emit('message', data);
    });

    socket.on('login', (data) => {
        if (!data?.username || !data?.password || !data?.language) return socket.emit("login", { success: false, message: language.get(data?.language || "en", "login_error")});        
        auth.login(data?.username, data?.password, (err, user) => {
            if (user == null) return socket.emit('login', { success: false, message: language.get(data?.language || "en", err || "login_error")});
            socket.emit('login', {
                success: true,
                user: user
            });
        });
    });

    socket.on('register', (data) => {
        if (!(data?.user && data?.username && data?.password && data?.password2 && data?.language)) return socket.emit("register", { success: false, message: language.get(data?.language || "en", "register_error")});
        if (data?.password !== data?.password2) return socket.emit("register", { success: false, message: language.get(data?.language || "en", "password_not_match")});

        // check if username is email or phone
        let email = null;
        let phone = null;
        if (data?.username.includes("@")) email = data.username;
        else phone = data.username;

        auth.register(data?.user, data?.password, email, phone, (err, user) => {
            if (user == null) return socket.emit('register', { success: false, message: language.get(data?.language || "en", err || "register_error")});
            socket.emit('login', {
                success: true,
                user: user
            });
        });
    });
});