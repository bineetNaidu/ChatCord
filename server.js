const express = require("express");
const http = require("http");
const PORT = process.env.PORT || 3000;
const path = require("path"); //path modulo
const socketio = require("socket.io");
const formatMessage = require("./utilities/messages.js");
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
} = require("./utilities/users.js");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

const botName = "@admin";

// run when user connnects
io.on("connection", (socket) => {
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // welcome greet to current joined user
        socket.emit("message", formatMessage(botName, "Welcome to CHATCHOD!")); // !seen  to current loged user!!

        // broadcast when a user connects
        socket.broadcast
            .to(user.room)
            .emit(
                "message",
                formatMessage(botName, `${user.username} has join the chat`)
            ); // send to all the user  exept who logged in!!

        // when someone has join chat send user and room's info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room),
        });
    });

    // listen for ChatMessage
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit("message", formatMessage(user.username, msg));
    });

    // Runs when user disconnects
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit(
                "message",
                formatMessage(botName, `${user.username} has left the chats`)
            );

            // when someone has LEAVES the chat send user and room's info
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        }
    });
});

server.listen(PORT, () => {
    console.log("*********************");
    console.log("SERVER IS RUNNING");
    console.log(`ON PORT ${PORT}`);
    console.log("*********************");
});
