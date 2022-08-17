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
    .setDescription("Setup tickets, set ticket options, and remove ticket options")
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
        })
        .addRoleOption((option) => {
          return option
            .setName("support_role")
            .setDescription("The role to assign to support tickets.")
            .setRequired(true);
        })
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Deletes config for the tickets.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("options")
        .setDescription("Sets options for the tickets.")
        .addStringOption((option) => {
          return option
            .setName("description")
            .setDescription("The description for the ticket category.")
            .setRequired(true);
        })
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("description_delete")
        .setDescription("Deletes description for the tickets.")
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
      const supportRole = interaction.options.getRole("support_role");

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
          supportRole: supportRole.id,
          embedDescription: null,
        }).save();
      }
      await interaction.deferReply();

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

      await interaction.followUp({
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
    } else if (interaction.options.getSubcommand() === "options") {
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
        const description = interaction.options.getString("description");
        ticketSchema
          .findOneAndUpdate(
            { guildId: interaction.guild.id },
            { embedDescription: description }
          )
          .catch((err) => {
            console.log(err);
          });

        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("Ticket system successfully updated!")
              .setColor(0x00ff00),
          ],
          ephemeral: true,
        });
      }
    } else if(interaction.options.getSubcommand() === "description_delete") {
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
        ticketSchema
          .findOneAndUpdate(
            { guildId: interaction.guild.id },
            { embedDescription: null }
          )
          .catch((err) => {
            console.log(err);
          });

        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("Ticket system successfully updated!")
              .setColor(0x00ff00),
          ],
          ephemeral: true,
        });
      }
    }
  },
};

