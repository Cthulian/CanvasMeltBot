const { SlashCommandBuilder, Routes } = require('discord.js')
const { REST } = require('@discordjs/rest')
const dotenv = require('dotenv')

dotenv.config()

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong!'),
  new SlashCommandBuilder()
    .setName('server')
    .setDescription('Replies with server info!'),
  new SlashCommandBuilder()
    .setName('user')
    .setDescription('Replies with user info!'),
  new SlashCommandBuilder()
    .setName('melt')
    .setDescription('Melting Time Babyyy!')
    .addIntegerOption((option) =>
      option
        .setName('damage')
        .setDescription('How much melt you want')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('meltmotion')
    .setDescription('Melting Time Babyyy!')
    .addIntegerOption((option) =>
      option
        .setName('damage')
        .setDescription('How much melt you want')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('frames')
        .setDescription('How long melt you want')
        .setRequired(true)
    ),
].map((command) => command.toJSON())

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN)

rest
  .put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  )
  .then((data) =>
    console.log(`Successfully registered ${data.length} application commands.`)
  )
  .catch(console.error)
