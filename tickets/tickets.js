const {
  SlashCommandBuilder,
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
    .setName("ticket")
    .setDescription("Configure the ticket system")
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
            .setName("logging_channel")
            .setDescription("Logs a ticket after its been closed")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText);
        })
        .addRoleOption((option) => {
          return option
            .setName("support_role")
            .setDescription("The role to assign to support tickets.")
            .setRequired(true);
        })
        .addStringOption((option) => {
          return option
            .setName("description")
            .setDescription("The ticket systems description")
            .setRequired(false);
        })
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
      const ticketlog = interaction.options.getChannel("logging_channel");
      const supportRole = interaction.options.getRole("support_role");
      const description =interaction.options.getString("description") || "Click the `Create Ticket` button below to create a ticket and out support team will be right with you!";

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
          ticketlog: ticketlog.id,
          supportRole: supportRole.id,
        }).save();
      }

      channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("Create a ticket!")
            .setDescription(description)
            .setColor("Blurple"),
        ],
        components: [
          new ActionRowBuilder().setComponents(
            new ButtonBuilder()
              .setCustomId("createTicket")
              .setLabel("Create Ticket!")
              .setStyle(ButtonStyle.Primary)
              .setEmoji("<:ticketbadge:1010601796374364171>")
          ),
        ],
      });

      interaction.reply({
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
            .setColor("Green"),
        ],
        ephemeral: true
      });
    }
    if (interaction.options.getSubcommand() === "delete") {
      const ticketConfig = await ticketSchema.findOne({
        guildId: interaction.guild.id,
      });
      if (!ticketConfig) {
        const NotCreatedSystem = new EmbedBuilder()
          .setDescription(
            "You have not created a ticket system yet! To create one run `/tickets setup`."
          )
          .setColor("Red");
        interaction.reply({ embeds: [NotCreatedSystem] });
      } else {
        await ticketSchema.findOneAndDelete({ guildId: interaction.guild.id });

        const CreatedSystem = new EmbedBuilder()
          .setDescription("Ticket system successfully deleted!")
          .setColor("Red");
        interaction.reply({ embeds: [CreatedSystem] });
      }
    }
  },
};
