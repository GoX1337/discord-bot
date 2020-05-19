require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();

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
		connection.on('speaking', (user, speaking) => {
			console.log(user.username, speaking);
		});
	}
});
