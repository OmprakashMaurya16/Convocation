const mongoose = require("mongoose");

const eventMetaSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    activeSince: {
      type: Date,
      required: true,
      default: () => new Date(0),
    },
  },
  { timestamps: true },
);

const EventMeta = mongoose.model("EventMeta", eventMetaSchema);

module.exports = EventMeta;
