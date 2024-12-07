const { Client, Intents } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource } = require('@discordjs/voice');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', () => {
    console.log('봇이 준비되었습니다!');
});

client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!join')) {
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            return message.reply('먼저 음성 채널에 들어가야 합니다.');
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

        message.reply('음성 채널에 들어왔습니다!');

        const checkVoiceChannel = setInterval(() => {
            if (voiceChannel.members.size === 1) { // 자신만 있을 때
                message.channel.send('인원이 없어 전 나가겠습니다.');
                connection.destroy();
                clearInterval(checkVoiceChannel);
            }
        }, 5000); // 5초마다 체크

    } else if (message.content.startsWith('!leave')) {
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            return message.reply('먼저 음성 채널에 들어가야 합니다.');
        }

        message.channel.send(`${message.member.displayName}님이 나가기를 요청했습니다.`);
        const connection = getVoiceConnection(message.guild.id);
        if (connection) {
            connection.destroy();
        }
    }
});

// 메시지를 읽어주는 기능
client.on('messageCreate', (message) => {
    if (message.member.voice.channel) {
        const player = createAudioPlayer();
        const resource = createAudioResource(`https://tts-api.com/tts.mp3?text=${encodeURIComponent(message.content)}`);
        player.play(resource);
        const connection = getVoiceConnection(message.guild.id);
        if (connection) {
            connection.subscribe(player);
        }
    }
});

client.login('YOUR_BOT_TOKEN');
