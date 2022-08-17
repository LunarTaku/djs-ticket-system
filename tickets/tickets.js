const {
  SlashCommandBuilder,
  CommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const ticketSchema = require("../../schemas/ticketSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tickets")
    .setDescription("Gets the ping of the bot!")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("setup")
        .setDescription("Setup the ticket system")
        .addChannelOption((option) => {
          return option
            .setName("channel")
            .setDescription("The channel to send the ticket panel in.")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText);
        })
        .addChannelOption((option) => {
          return option
            .setName("category")
            .setDescription("The category to create the ticket in.")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildCategory);
        })
        .addChannelOption((option) => {
            return option
                .setName("transcripts")
                .setDescription("The channel to send the transcripts in.")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText);
            }
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Deletes config for the tickets.")
    ),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const ticketSystem = await ticketSchema.findOne({
      guildId: interaction.guild.id,
    });

    if (interaction.options.getSubcommand() === "setup") {
      const channel = interaction.options.getChannel("channel");
      const category = interaction.options.getChannel("category");
      const transcripts = interaction.options.getChannel("transcripts");

      if (ticketSystem) {
        ticketSystem.categoryId = category.id;
        ticketSystem.channelId = channel.id;

        ticketSystem.save().catch((err) => {
          console.log(err);
        });
      } else {
        new ticketSchema({
          guildId: interaction.guild.id,
          categoryId: category.id,
          channelId: channel.id,
          transcriptChannel: transcripts.id,
        }).save();
      }

      channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("Create a ticket!")
            .setDescription(
              "Click the `Create Ticket` button below to create a ticket and out support team will be right with you!"
            )
            .setColor(0x00ae86),
        ],
        components: [
          new ActionRowBuilder().setComponents(
            new ButtonBuilder()
              .setCustomId("createTicket")
              .setLabel("Create Ticket!")
              .setStyle(ButtonStyle.Primary)
              .setEmoji("<:FIJI_ticket:999672147440054352>")
          ),
        ],
      });

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Ticket System Setup")
            .setDescription("Ticket setup complete!")
            .addFields(
              {
                name: "Channel",
                value: `<#${channel.id}>`,
                inline: true,
              },
              {
                name: "Category",
                value: `${category.name}`,
                inline: true,
              }
            )
            .setColor(0x00ff00),
        ],
      });
    }
    if (interaction.options.getSubcommand() === "delete") {
      const ticketConfig = await ticketSchema.findOne({
        guildId: interaction.guild.id,
      });
      if (!ticketConfig) {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                "You have not created a ticket system yet! To create one run `/tickets setup`."
              )
              .setColor(0xff0000),
          ],
        });
      } else {
        await ticketSchema.findOneAndDelete({ guildId: interaction.guild.id });

        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("Ticket system successfully deleted!")
              .setColor(0x00ff00),
          ],
        });
      }
    }
  },
};
