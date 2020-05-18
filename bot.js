require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();

client.login(process.env.DISCORD_TOKEN);

client.once('ready', () => {
	console.log('Gox discord bot ready.');
});

client.on('message', async message => {
    console.log(`Message from ${message.author.username}: ${message.content}`);

    if (message.member && message.member.voice.channel) {
        const connection = await message.member.voice.channel.join();
        console.log(`Join voice channel "${message.member.voice.channel.name}"`);
	}
});
