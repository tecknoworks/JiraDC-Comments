const express = require("express");
const bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");
const fetch = require("node-fetch");
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

const Comment = require("./models/comment");
const e = require("express");

const port = 8091;
const baseUrl = "http://localhost";
const usersServiceUrl = baseUrl + ":8082";

var mongoDB =
  "mongodb+srv://cata:cata@cluster0.wcbqw.mongodb.net/first?retryWrites=true&w=majority";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.post("/comment", async (req, res) => {
  let newComment = req.body;
  var addComment = new Comment({
    content: newComment.content,
    user: newComment.user,
    date: new Date(newComment.date),
    work_item: newComment.work_item,
  });
  await Comment.create(addComment);
  res.send(newComment);
});
app.get("/comment", async (req, res) => {
  const record = await Comment.find({});
  res.send(record);
});
app.post("/allcomments", async (req, res) => {
  var result = [];
  if (req.body.length) {
    for (let index = 0; index < req.body.length; index++) {
      if (req.body[index] !== "") {
        const record = await Comment.find({ work_item: req.body[index] });
        let userIds = record.map((c) => c.user);
        let users = [];
        await fetch(usersServiceUrl + "/allusersselected", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userIds),
        })
          .then((res) => res.json())
          .then((data) => (users = data));

          if(record.length!==0){
            let commits=[]
        for (let index = 0; index < record.length; index++) {
          var dateTime = {
            year: record[index].date.getFullYear(),
            month: record[index].date.getMonth(),
            day: record[index].date.getDate(),
            hour: record[index].date.getHours(),
            minute: record[index].date.getMinutes(),
          };
          const commentElement = {
            _id: record[index]._id,
            content: record[index].content,
            user: users[index].username,
            date: dateTime,
            work_item: record[index].work_item,
          };
          commits.push(commentElement);
          
        }
        result.push(commits);
    }else{
        result.push([]);
    }
      } else {
        result.push([]);
      }
    }
  }
  res.json(result);
});
app.put("/comment", async (req, res) => {
  const newObject = req.body;
  let commentDate = new Date(
    newObject.date.year,
    newObject.date.month,
    newObject.date.day,
    newObject.date.hour,
    newObject.date.minute,
    newObject.date.seconds,
    newObject.date.miliseconds
  );
  const editedObject = { content: newObject.content };
  const filter = {
    user: newObject.user,
    work_item: newObject.work_item,
    date: commentDate,
  };
  let update_ = await Comment.findOneAndUpdate(filter, editedObject, {
    new: true,
    upsert: true,
  });
  res.send(update_);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
