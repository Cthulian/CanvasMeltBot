// Require the necessary discord.js classes
const {
  Client,
  GatewayIntentBits,
  AttachmentBuilder,
  EmbedBuilder,
} = require('discord.js')
const dotenv = require('dotenv')
const Canvas = require('@napi-rs/canvas')
const GifEncoder = require('gif-encoder')

dotenv.config()

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!')
})

/* const applyText = (canvas, text) => {
  const context = canvas.getContext('2d')

  let fontSize = 70

  do {
    context.font = `${(fontSize -= 10)}px sans-serif`
  } while (context.measureText(text).width > canvas.width - 300)

  return context.font
} */

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const { commandName } = interaction

  if (commandName === 'ping') {
    await interaction.reply('Pong!')
  } else if (commandName === 'server') {
    await interaction.reply(
      `Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`
    )
  } else if (commandName === 'user') {
    await interaction.reply(
      `Your tag: ${interaction.user.tag}\n id:${interaction.user.id}`
    )
  } else if (commandName === 'melt') {
    // Initialization
    const damage = interaction.options.getInteger('damage')

    const cOutput = Canvas.createCanvas(1000, 1000)
    const ctxOutput = cOutput.getContext('2d')

    const cSource = Canvas.createCanvas(1000, 1000)
    const ctxSource = cSource.getContext('2d')

    const cMap = Canvas.createCanvas(1000, 1000)
    const ctxMap = cMap.getContext('2d')

    const assetImageSource = await Canvas.loadImage('./images/cone.jpg')
    const mapImageSource = await Canvas.loadImage(
      './images/Melt-Reference-with-gradient-perlin.png'
    )

    const cw = 1000
    const ch = 1000

    let sourceData = ctxOutput.createImageData(cw, ch)
    let mapData = ctxOutput.createImageData(cw, ch)
    const outputData = ctxOutput.createImageData(cw, ch)

    const sourceImg = assetImageSource
    const mapImg = mapImageSource

    ctxSource.drawImage(sourceImg, 0, 0)
    sourceData = ctxSource.getImageData(0, 0, cw, ch).data

    ctxMap.drawImage(mapImg, 0, 0)
    mapData = ctxMap.getImageData(0, 0, cw, ch).data

    console.log('Source and map data cached')

    // Melting Time

    const dy = damage * -1
    // const dx = 0

    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        // Get the greyscale value from the displacement map as a value between 0 and 1
        // 0 = black (farthest), 1 = white (nearest)
        // Higher values will be more displaced

        const pix = y * cw + x
        const arrayPos = pix * 4
        const depth = mapData[arrayPos] / 255

        // Use the greyscale value as a percentage of our current drift
        // and calculate an y pixel offset based on that
        let ofs_x = x
        let ofs_y = Math.round(y + dy * depth)

        // Clamp the offset to the canvas dimenstions
        if (ofs_x < 0) ofs_x = 0
        if (ofs_x > cw - 1) ofs_x = cw - 1
        if (ofs_y < 0) ofs_y = 0
        if (ofs_y > ch - 1) ofs_y = ch - 1

        // Get the colour from the source image at the offset xy position,
        // and transfer it to our output at the original xy position
        const targetPix = ofs_y * cw + ofs_x
        const targetPos = targetPix * 4

        outputData.data[arrayPos] = sourceData[targetPos]
        outputData.data[arrayPos + 1] = sourceData[targetPos + 1]
        outputData.data[arrayPos + 2] = sourceData[targetPos + 2]
        outputData.data[arrayPos + 3] = sourceData[targetPos + 3]
      }
    }
    ctxOutput.putImageData(outputData, 0, 0)

    const attachment = new AttachmentBuilder(await cOutput.encode('png'), {
      name: 'melted-asset.png',
    })

    interaction.reply({ files: [attachment] })
  } else if (commandName === 'meltmotion') {
    await interaction.reply('Melting in progress')
    // Initialization
    const DRIFT_RANGE = interaction.options.getInteger('damage')
    const GIF_LENGTH = interaction.options.getInteger('frames')
    const meltedGif = new GifEncoder(1000, 1000, {
      highWaterMark: 100 * 1024 * 1024,
    })
    const file = require('fs').createWriteStream('melt.gif')
    meltedGif.pipe(file)

    const cOutput = Canvas.createCanvas(1000, 1000)
    const ctxOutput = cOutput.getContext('2d')

    const cSource = Canvas.createCanvas(1000, 1000)
    const ctxSource = cSource.getContext('2d')

    const cMap = Canvas.createCanvas(1000, 1000)
    const ctxMap = cMap.getContext('2d')

    const assetImageSource = await Canvas.loadImage('./images/cone.jpg')
    const mapImageSource = await Canvas.loadImage(
      './images/Melt-Reference-with-gradient-simplex.png'
    )

    const cw = 1000
    const ch = 1000

    let sourceData = ctxOutput.createImageData(cw, ch)
    let mapData = ctxOutput.createImageData(cw, ch)
    const outputData = ctxOutput.createImageData(cw, ch)

    const sourceImg = assetImageSource
    const mapImg = mapImageSource

    ctxSource.drawImage(sourceImg, 0, 0)
    sourceData = ctxSource.getImageData(0, 0, cw, ch).data

    ctxMap.drawImage(mapImg, 0, 0)
    mapData = ctxMap.getImageData(0, 0, cw, ch).data

    console.log('Source and map data cached')

    // Melting Time

    let dy = DRIFT_RANGE * -1

    meltedGif.writeHeader()
    // const dx = 0
    for (let i = 0; i < GIF_LENGTH; i++) {
      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          // Get the greyscale value from the displacement map as a value between 0 and 1
          // 0 = black (farthest), 1 = white (nearest)
          // Higher values will be more displaced

          const pix = y * cw + x
          const arrayPos = pix * 4
          const depth = mapData[arrayPos] / 255

          // Use the greyscale value as a percentage of our current drift
          // and calculate an y pixel offset based on that
          let ofs_x = x
          let ofs_y = Math.round(y + dy * depth)

          // Clamp the offset to the canvas dimenstions
          if (ofs_x < 0) ofs_x = 0
          if (ofs_x > cw - 1) ofs_x = cw - 1
          if (ofs_y < 0) ofs_y = 0
          if (ofs_y > ch - 1) ofs_y = ch - 1

          // Get the colour from the source image at the offset xy position,
          // and transfer it to our output at the original xy position
          const targetPix = ofs_y * cw + ofs_x
          const targetPos = targetPix * 4

          outputData.data[arrayPos] = sourceData[targetPos]
          outputData.data[arrayPos + 1] = sourceData[targetPos + 1]
          outputData.data[arrayPos + 2] = sourceData[targetPos + 2]
          outputData.data[arrayPos + 3] = sourceData[targetPos + 3]
        }
      }
      // ctxOutput.drawImage(mapImg, 0, 0)
      ctxOutput.putImageData(outputData, 0, 0)
      meltedGif.addFrame(ctxOutput.getImageData(0, 0, ch, cw).data)
      dy -= DRIFT_RANGE
    }
    meltedGif.finish()
    const attachment = new AttachmentBuilder('melt.gif')
    const embed = new EmbedBuilder()
      .setTitle('Test Melt Gif')
      .setImage('attachment://melt.gif')
    interaction.editReply({ embeds: [embed], files: [attachment] })
  }
})

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN)
