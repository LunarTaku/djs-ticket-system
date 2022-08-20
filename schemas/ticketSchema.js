const { Schema, model } = require("mongoose");
const ticketCreateSchema = new Schema({
  guildId: String,
  channelId: String,
  categoryId: String, 
  ticketlog: String,
  supportRole: String,
  embedDescription: String,
});

module.exports = model("ticketSchema", ticketCreateSchema, "userTickets");
