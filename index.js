import dotenv from 'dotenv'
import { Client, GatewayIntentBits } from 'discord.js'
import { joinVoiceChannel, createAudioPlayer, createAudioResource } from '@discordjs/voice'
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

client.login(process.env.DISCORD_TOKEN);

let connection;
let guild;

const playSound = (sound) => {
  const player = createAudioPlayer();
  const audioPath = path.join(__dirname, 'sounds', sound);
  const resource = createAudioResource(audioPath);

  player.play(resource);
  connection.subscribe(player);
}

client.on('ready', async () => {
  const channelId = '1205934257860640829'
  const guildId = '743486875876065411'
  guild = client.guilds.cache.get(guildId);

  connection = joinVoiceChannel({
    channelId,
    guildId,
    adapterCreator: client.guilds.cache.get(guildId).voiceAdapterCreator,
  });


  setInterval(async () => {
    const botMember = await guild.members.fetch(client.user.id);

    if (!botMember.voice.channel || botMember.voice.channel.id !== channelId) {
      connection = joinVoiceChannel({
        channelId,
        guildId,
        adapterCreator: client.guilds.cache.get(guildId).voiceAdapterCreator,
      });
    }
  }, 3000);
})

client.on('voiceStateUpdate', async (oldState, newState) => {
  if (!oldState.channel && newState.channel) {
    console.log(`${newState.member.user.tag} joined ${newState.channel.name}`);
    const botMember = await guild.members.fetch(client.user.id);

    // Check if the user is not already muted
    if (!newState.serverMute) {
      // Mute the user
      newState.setMute(true, 'User was automatically muted on joining the voice channel')
        .then(() => console.log(`${newState.member.user.tag} has been muted`))
        .catch(console.error);

      if (botMember.voice.channel) {
        playSound('knockdoor.mp3')
        setTimeout(() => {
          playSound('who.mp3')
          setTimeout(() => {
            playSound('coming-dooropen.mp3')
            setTimeout(() => {
              newState.setMute(false, 'User was automatically muted on joining the voice channel')
                .then(() => console.log(`${newState.member.user.tag} has been unmuted`))
                .catch(console.error)
            }, 5000);
          }, 4000);
        }, 2500);
      }
    }
  }
});


