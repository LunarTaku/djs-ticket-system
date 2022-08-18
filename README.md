![Image](https://cdn.discordapp.com/attachments/1009197481915056160/1009240837055586364/TICKET_SYSTEM.jpg)

# djs-ticket-system
This DJS ticket system with transcripts is fully configurable, you can change the transcripts channel, tickets channel, and more! This command uses embeds, and buttons.

# CHANGELOG #1
- Added support roles.
- Added user to ticket.
- Added optional description for ticket.
- Fixed "Unknown Interaction" or "Interaction already sent or deffered" errors.
- FIxed other errors.

## Dependencies:
-  mongoose => `npm i mongoose`
-  chalk => `npm i chalk@4.1.2`
-  dotenv => `npm i dotenv`
- discord-html-transcripts => `npm i discord-html-transcripts`

# Instructions:
1) Place the command into your commands folder.
2) Create a new folder in the bot root direcatory and name it "schemas", and than place the schema in there.
3) Change all the paths to the right ones if needed.
4) Place the event into your events folder.

# MongoDB Connection:
- be sure to add this to your ready.js file.
```
    // Add this to the top of the file
    const { connect } = require('mongoose')
    const chalk = require("chalk")
    
    // Add this to your ready.js file
    await connect(MONGO_URI)
      .then(() => {
        console.log(chalk.yellow(`✅ >>> Successfully connected to MongoDB!`));
      })
      .catch((err) => {
        console.log(err);
      });
```

# Preview

### The Ticket Panel
![Preview1](https://cdn.discordapp.com/attachments/1009197481915056160/1009241097559625778/unknown.png)
### Ticket transcripts
![Preview2](https://cdn.discordapp.com/attachments/1009197481915056160/1009241409393545297/unknown.png)
### Inside the ticket
![Preview3](https://cdn.discordapp.com/attachments/1009241617288401006/1009241822234693722/unknown.png)

# Contributing:
> if you want to contribute create a fork of this project and when you are done editing it update the fork and create a pull request.
