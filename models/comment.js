const mongoose = require('mongoose')

const model = mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    work_item:{
        type: String,
        required: true
    }
});

module.exports = new mongoose.model("Comment", model)