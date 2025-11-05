const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
require("mongoose-uuid2")(mongoose);

const sessionsSchema = mongoose.Schema({
  _id: { type: mongoose.Schema.Types.UUID, default: uuidv4 },
  userId: { type: mongoose.Schema.Types.UUID, default: uuidv4 },
  startTime: mongoose.Schema.Types.Date,
  endTime: mongoose.Schema.Types.Date,
  isActive: mongoose.Schema.Types.Boolean,
});

const Sessions123 = mongoose.model("sessions", sessionsSchema);
module.exports = Sessions123;
