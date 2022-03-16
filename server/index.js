const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const UserRouter = require("./Router/UserRouter");
const ChatRouter = require("./Router/ChatRouter");
const MessageRouter = require("./Router/MessageRouter");

const mongoose = require("mongoose");

const app = express();
dotenv.config();

//Kết nối database
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const server = app.listen(
      PORT,
      console.log("Server start with port", PORT),
    );
    const io = require("socket.io")(server, {
      pingTimeout: 60000,
      cors: {
        origin: "http://localhost:3000",
      },
    });
    io.on("connection", (socket) => {
      socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
      });
      socket.on("join_chat", (room) => {
        socket.join(room);
      });

      socket.on("new_message", (newMessage) => {
        let chat = newMessage.chat;
        if (!chat.users) return;
        chat.users.forEach((user) => {
          if (user._id == newMessage.sender._id) return;
          socket.in(user._id).emit("message_received", newMessage);
        });
      });
      socket.on("typing", (room) => socket.in(room).emit("typing"));
      socket.on("stop_typing", (room) => socket.in(room).emit("stop_typing"));
      socket.off("setup", () => {
        socket.leave(userData._id);
      });
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit();
  });

app.use(cors());
app.use(express.json());

//Router
app.use("/api/user", UserRouter);
app.use("/api/chat", ChatRouter);
app.use("/api/message", MessageRouter);
