require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const { Transform } = require('stream');
const googleSpeech = require('@google-cloud/speech')
const client = new Discord.Client();
const googleSpeechClient = new googleSpeech.SpeechClient();

function convertBufferTo1Channel(buffer) {
  const convertedBuffer = Buffer.alloc(buffer.length / 2);
  for (let i = 0; i < convertedBuffer.length / 2; i++) {
    const uint16 = buffer.readUInt16LE(i * 4);
    convertedBuffer.writeUInt16LE(uint16, i * 2);
  }
  return convertedBuffer
}

class ConvertTo1ChannelStream extends Transform {
  constructor(source, options) {
    super(options);
  }
  _transform(data, encoding, next) {
    next(null, convertBufferTo1Channel(data))
  }
}

client.login(process.env.DISCORD_TOKEN);

client.once('ready', () => {
	console.log(`${client.user.tag} discord bot is ready.`);
});

client.on("disconnected", () => {
	console.log("Disconnected!");
	process.exit(1);
});

client.on('error', error => {
	console.error(error);
});

let connection = null;

client.on('message', async message => {
	console.log(`Message from ${message.author.username}: ${message.content}`);

	if (message.member && message.member.voice.channel && message.author.username === "GoX") {
		console.log(`Join voice channel "${message.member.voice.channel.name}"`);
		connection = await message.member.voice.channel.join();
		connection.play("roblox-death.mp3");

		const receiver = connection.receiver;

		connection.on('speaking', (user, speaking) => {
			console.log(user.username, speaking.bitfield ? "is speaking" : "stopped to speak");

			const audioStream = receiver.createStream(user, { mode: 'pcm', end: 'silence' });
			const requestConfig = {
			  encoding: 'LINEAR16',
			  sampleRateHertz: 48000,
			  languageCode: 'fr-FR'
			};
			const request = {
			  config: requestConfig
			};
			const recognizeStream = googleSpeechClient
			  .streamingRecognize(request)
			  .on('error', console.error)
			  .on('data', response => {
				const transcription = response.results
				  .map(result => result.alternatives[0].transcript)
				  .join('\n')
				  .toLowerCase();
				console.log(`Transcription: ${transcription}`);

				message.channel.send(user.username + " à dit: \"" + transcription + "\"");
		
				if (transcription === 'yes') {
				  connection.channel.members.array().forEach(member => {
					if (member.user.id !== discordClient.user.id) {
					  console.log(`Moving member ${member.displayName} to channel ${channelId}`);
					  member.edit({ channel: channelId }).catch(console.error);
					  memberVoiceChannel.leave();
					}
				  });
				} else if (transcription === 'no') {
				  memberVoiceChannel.leave();
				}
			});
		
			const convertTo1ChannelStream = new ConvertTo1ChannelStream();
		
			audioStream.pipe(convertTo1ChannelStream).pipe(recognizeStream);
		
			audioStream.on('end', async () => {
				//console.log('audioStream end');
			});
		});
	}
});
