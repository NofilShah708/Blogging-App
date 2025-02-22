const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI);
const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  profilepic: {
    type: String,
    default: "default.webp",
  },
});

module.exports = mongoose.model("user", userSchema);
