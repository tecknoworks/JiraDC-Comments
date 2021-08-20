const express = require('express')
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors')
const fetch = require("node-fetch");
const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

const Comment = require('./models/comment')

const port = 8091
const baseUrl = 'http://localhost';
const usersServiceUrl = baseUrl + ':8082';

var mongoDB = 'mongodb+srv://cata:cata@cluster0.wcbqw.mongodb.net/first?retryWrites=true&w=majority';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.post('/comment', async (req, res) => {
    let newComment = req.body
    console.log(newComment)
    var addComment=new Comment({content:newComment.content,user:newComment.user,date:new Date(newComment.date),work_item:newComment.work_item})
    await Comment.create(addComment)
    res.send(newComment)
})
app.get('/comment', async (req, res) => {
    const record= await Comment.find({})
    res.send(record)
})

app.post('/allItemComments', async (req, res) =>{
    const record= await Comment.find({'work_item':req.body._id})
    let userIds=record.map(c => c.user);
    let users=[]
    await fetch(usersServiceUrl + '/allusersselected', 
    { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userIds)
    })
    .then(res => res.json())
    .then(data => users = data);

    let result=[]
    for (let index = 0; index < record.length; index++) {

        const commentElement = {
            _id: record[index]._id,
            content:record[index].content,
            user:users[index].username,
            date:record[index].date,
            work_item:record[index].work_item,
        }
        result.push(commentElement);   
    }  
    res.json(result)
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })