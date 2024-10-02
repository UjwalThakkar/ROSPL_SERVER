// const cors = require("cors");
// const bodyParser = require("body-parser");
// const express = require("express");
// const { generateToken, greet, greetUser } = require("./controller");

// const app = express();

// app.use(cors());
// app.use(bodyParser.json());
// app.use("/user", require("./routes.js"));

// const port = 4000;

// app.listen(port, () => {
//   console.log("server is running on port: ", port);
// });

const express = require("express");
const cors = require("cors");
const { generateToken04 } = require("./zegoServerAssistant");
const { Server } = require("socket.io");
const app = express();
app.use(cors());
app.use(express.json());

// app.use("/api/messages", MessageRoutes); also import MessageRoutes.js

app.get("/generate-token/:userId", (req, res) => {
  try {
    const appId = enter_your_appid;
    const serverSecret = "enter you server secret";
    const userId = req.params.userId;
    const effectiveTime = 3600;
    const payload = "";
    if (appId && serverSecret && userId) {
      const token = generateToken04(appId, userId, serverSecret, effectiveTime);
      res.status(200).json({ token });
    } else {
      return res
        .status(400)
        .send("User id, app id, and server secret is required!");
    }
  } catch (error) {
    console.log(error);
  }
});

const server = app.listen(3001, () => {
  console.log("Server running on port 3001");
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (uesrId) => {
    console.log("add-user triggred");
    onlineUsers.set(uesrId, socket.id);
    console.log(onlineUsers);
  });

  socket.on("out-going-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-voice-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });

  socket.on("out-going-video-call", (data) => {
    console.log("out-going-video-call triggred");
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-video-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });

  socket.on("reject-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("voice-call-rejected");
    }
  });

  socket.on("reject-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("video-call-rejected");
    }
  });

  socket.on("accept-incomming-call", ({ id }) => {
    const sendUserSocket = onlineUsers.get(id);
    socket.to(sendUserSocket).emit("accept-call");
  });
});
