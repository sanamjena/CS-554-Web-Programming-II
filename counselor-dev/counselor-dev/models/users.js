const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
require("mongoose-uuid2")(mongoose);

var validateEmail = function (email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const usersSchema = mongoose.Schema({
  _id: { type: mongoose.Schema.Types.UUID, default: uuidv4 },
  email: {
    type: mongoose.Schema.Types.String,
    trim: true,
    lowercase: true,
    unique: true,
    required: "Email address is required",
    validate: [validateEmail, "Please fill a valid email address"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  firstName: mongoose.Schema.Types.String,
  lastName: mongoose.Schema.Types.String,
  currency: mongoose.Schema.Types.String,
  hashedPassword: mongoose.Schema.Types.String,
  published: mongoose.Schema.Types.Mixed,
  purchased: mongoose.Schema.Types.Mixed,
  courses: mongoose.Schema.Types.Mixed,
  balance: mongoose.Schema.Types.Number,
  privateKey: mongoose.Schema.Types.String,
  publicKey: mongoose.Schema.Types.String,
});

const Users123 = mongoose.model("users", usersSchema);
module.exports = Users123;
