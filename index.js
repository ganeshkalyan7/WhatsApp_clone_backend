const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const Rooms = require("./RoomShema");
const Messages = require("./MessageSchema");
const Pusher = require("pusher");
const dotenv = require("dotenv");
dotenv.config();

app.use(express.json());
app.use(cors());
//pusher
const pusher = new Pusher({
  appId: "1330597",
  key: "6fbb654a0e0b670de165",
  secret: "a96c94ba1f510bc260e2",
  cluster: "ap2",
  useTLS: true,
});

//mongodb connection
mongoose.connect(process.env.MONGOOSE_URL);
const db = mongoose.connection;
db.once("open", () => {
  console.log("DB connected");
  const roomCollection = db.collection("rooms");
  const changeStream = roomCollection.watch();

  changeStream.on("change", (change) => {
    console.log(change);
    if (change.operationType === "insert") {
      const roomDetails = change.fullDocument;
      pusher.trigger("room", "inserted", roomDetails);
    } else {
      console.log("Not a expected event to trigger");
    }
  });

  const msgCollection = db.collection("messages");
  const changeStream1 = msgCollection.watch();

  changeStream1.on("change", (change) => {
    console.log(change);
    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", messageDetails);
    } else {
      console.log("Not a expected event to trigger");
    }
  });
});

//messages data API
app.post("/messages/create", (req, res) => {
  const dbMessage = req.body;
  Messages.create(dbMessage, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.status(201).send(data);
    }
  });
});
//get by id
app.get("/messages/:id", (req, res) => {
  Messages.find({ roomId: req.params.id }, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.status(200).send(data);
    }
  });
});

// rooms data API
//post request
app.post("/group/create", (req, res) => {
  const name = req.body.groupName;
  Rooms.create({ name }, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.status(201).send(data);
    }
  });
});
//get request
app.get("/all/rooms", (req, res) => {
  Rooms.find({}, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.status(200).send(data);
    }
  });
});
//get by id
app.get("/room/:id", (req, res) => {
  Rooms.find({ _id: req.params.id }, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.status(200).send(data[0]);
    }
  });
});
app.get("/", (req, res) => {
  res.send("Hello World!");
});
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`server running on port number ${PORT}`);
});
