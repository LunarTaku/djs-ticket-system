// Upated version 8/17/2022 7:03PM
// V1.2.0

const {
  Client,
  CommandInteraction,
  InteractionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const ticketSchema = require("../../schemas/ticketSchema");
const { createTranscript } = require("discord-html-transcripts");

module.exports = {
  name: "interactionCreate",

  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    const config = await ticketSchema.findOne({
      guildID: interaction.guild.id,
    });

    // check if the user clicked the "create ticket" button
    if (interaction.customId == "createTicket") {
      
      // Check if config does not exist, if it does it will create one.
      if (!config) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Ticket System")
              .setDescription(
                "You have not set up the ticket system yet! Use `/ticket setup` to set it up!"
              )
              .setColor("Red"),
          ],
        });
        return;
      }

      const category = interaction.guild.channels.cache.get(config.categoryId);

      const {
        SendMessages,
        ViewChannel,
        AddReactions,
        AttachFiles,
        EmbedLinks,
        ReadMessageHistory,
      } = PermissionFlagsBits;

      // Create the ticket channel
      const channel = await category.children.create({
        name: `ticket-${Math.floor(Math.random() * 100000)}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel], // view channel
          },
          {
            id: interaction.guild.id,
            allow: [
              SendMessages,
              ViewChannel,
              AddReactions,
              AttachFiles,
              EmbedLinks,
              ReadMessageHistory,
            ],
          },
        ],
      });

      // send the "ticket created" message
      channel.send({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: interaction.user.username,
              iconURL: interaction.user.avatarURL(),
            })
            .setTitle(`${interaction.user.username} has created a ticket!`)
            .setDescription(
              `welcome ${interaction.user.username} to this ticket! Please wait for a staff member to reply to your ticket, or if you created it by accidentally please use the "close ticket" button to close it.`
            )
            .setColor("Random"),
        ],
        components: [
          new ActionRowBuilder().setComponents(
            new ButtonBuilder()
              .setCustomId("ticket-close")
              .setLabel("Close Ticket")
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId("saveChat")
              .setLabel("Save Transcript")
              .setStyle(ButtonStyle.Secondary)
          ),
        ],
      });

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("Your ticket has been successfully created!")
            .setColor("Green"),
        ],
        ephemeral: true,
      });
    }
    // checks if user clicked the "close ticket" button
    else if (interaction.customId == "ticket-close") {
      await interaction.reply({
        embeds: [
          new EmbedBuilder().setDescription(
            "<:FIJI_clock:999673593170509945> Ticket will be deleted in T-10 seconds!"
          ),
        ],
        ephemeral: true,
      });
      setTimeout(() => {
        interaction.channel.delete();
      }, 10000);
    }
    // checks if user clicked the "save transcript" button and saves the transcript
    else if (interaction.customId == "saveChat") {
      await interaction.deferReply();
      const { channel } = interaction;
      const reply = new EmbedBuilder()
        .setTitle(`Transcript saved`)
        .setDescription(`Saved Transcript: <#${config.transcriptChannel}>`)
        .setColor("BLUE");

      const attachment = await createTranscript(channel, {
        limit: -1,
        returnBuffer: false,
        fileName: `${channel}.html`,
      });

      client.channels.cache.get(config.transcriptChannel).send({
        embeds: [reply],
        files: [attachment],
      });

      await interaction.followUp({
        content: `Transcript has been successfully saved to <#${config.transcriptChannel}>!`,
        ephemeral: true,
      });
    }
  },
};
