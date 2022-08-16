const { Schema, model } = require("mongoose");
const ticketCreateSchema = new Schema({
  guildId: String,
  channelId: String,
  categoryId: String, 
  transcriptChannel: String,
});

module.exports = model("ticketSchema", ticketCreateSchema, "userTickets");