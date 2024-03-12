let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    username: String,
    logs: [{
        description: String,
        duration: Number,
        date: Date,
    }]
})

module.exports = mongoose.model('User', userSchema);