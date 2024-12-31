const mongoose = require('mongoose');
mongoose.connect(`mongodb://localhost:27017/minisocialmediaapp`);

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
    }],
    profilepic: {
        type: String,
        default: 'default.webp'
    }
})

module.exports = mongoose.model('user', userSchema);