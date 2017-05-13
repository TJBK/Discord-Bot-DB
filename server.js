/*jshint esversion: 6 */
//Needs
const discord = require("discord.js");
const client = new discord.Client();
const request = require('request');
const jsdom = require("jsdom");
const mongoose = require('mongoose');
const assert = require('assert');
const mongodbURL = 'mongodb://127.0.0.1:27017/botMain';
const toMarkdown = require('to-markdown');
const url = 'http://efukt.com/random.php';
const token = 'MzA4MDUwMjQ2ODg0MTMwODQw.C-bNqg.GnHk6JO19QkETIP2IJyEHjjOFs8';

//DB
mongoose.connect(mongodbURL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('We have connected');
});

const videoSchema = mongoose.Schema({
    name: String,
    description: String,
    posterURL: String
});

const serverSchema = mongoose.Schema({
    serverID: String,
    owner: String,
    prefix: String,
    usesBot: Boolean,
    nswfChannel: String
});

const dbv = mongoose.model('dbv', videoSchema);
const dbs = mongoose.model('dbs', serverSchema);

//vars
var title, colour, desc, img, newUrl, isVideo;

//lets
//let prefix = "<!";

//Start bot
client.on('ready', () => {
  client.user.setGame("DO !help");
  console.log(`Logged in as ${client.user.username}! We are currently serving ${client.guilds.array().length} servers.`);
  genNew();
});

//Get a new image/video from efukt
function genNew() {
  request({
    url: url,
    followRedirect: false
  }, function (err, res, body) {
    newUrl = res.headers.location;
    console.log(newUrl);
    //Parse the page
    jsdom.env({
      url: newUrl,
      scripts: ["https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"],
      done: function (err, window) {
        global.window = window;
        global.$ = window.$;
        global.document = window.document;
        getNeeds();
      }
    });
  });
}

//Get the elements we need
function getNeeds() {
  title = document.querySelector('.title').textContent;
  desc = document.querySelector('.desc').innerHTML;
  if (document.querySelector('#efukt_video')) {
    img = document.querySelector('#efukt_video').getAttribute('poster');
    isVideo = true;
    console.log("Yes it's a video");
  } else {
    img = document.querySelector('.image_content').src;
    isVideo = false;
    console.log("Not a video");
  }
  //Sets the colour for rich embed
  if (isVideo) {
    colour = "#008000";
  } else {
    colour = "#FF0000";
  }
  console.log(`Title: ${title}\ndesc: ${desc}\nPoster: ${img}`);
  var videoInfo = new dbv({
    name:title,
    description:desc,
    posterURL:img
  });
  videoInfo.save(function (err, videoInfo){
    if (err) return console.error(err);
  }); 
}

var commands = {	
	"test": {
		usage: "<name> <actual command>",
		description: "Creates command aliases. Useful for making simple commands on the fly",
		process: function(msg,suffix) {
			msg.channel.sendMessage('works');
		}
	}
};

function checkCommand(msg, ids) {
  dbs.findOne({serverID: ids}, function (err, docs) {
    const pre = docs.prefix;
    if (msg.author.id != client.user.id && (msg.content.startsWith(pre))) {
      var cmdTXT = msg.content.split(' ')[0].substring(pre.length);
      var suffix = msg.content.substring(cmdTXT.length+pre.length+1);
      
      if (msg.isMentioned(client.user)) {
        try {
          cmdTXT = msg.content.split(" ")[1];
          suffix = msg.content.substring(bot.user.mention().length+cmdTXT.length+pre.length+1);
        } catch(e) {
          msg.channel.sendMessage('You called?');
          return;
        }
      }

      if (cmdTXT === "ping") {
        msg.reply('Pong');
      }

      if (cmdTXT === "setprefix") {
        dbs.update({serverID: ids}, {$set: {prefix: suffix}}, {multi: true}, function (err, numReplaced) {
          msg.channel.sendMessage(`Your server prefix has been changed to **${suffix}**`).catch(console.error);
        });
      }

      if (cmdTXT === "setnsfw") {
        dbs.update({serverID: ids}, {$set: {nswfChannel: msg.channel.id}}, {multi: true}, function (err, numReplaced) {
          msg.channel.sendMessage(`This is set to the NSFW channel **${msg.channel.id}**`).catch(console.error);
        });
      }

      if (cmdTXT === "debug") {
        dbs.update({serverID: ids}, {$set: {nswfChannel: 0}}, {multi: true}, function (err, numReplaced) {
          msg.channel.sendMessage(`${msg.author.username} you have reset the bot`).catch(console.error);
        });
      }

      if (msg.channel.id === docs.nswfChannel) {
        if (cmdTXT === "efukt") {
          genNew();
          const embed = new discord.RichEmbed().setTitle(title).setColor(colour).setDescription(toMarkdown(desc)).setURL(newUrl).setImage(img);
          msg.channel.sendEmbed(embed).catch(console.error);
        }
      }
    }
  });
}

client.on('guildCreate', (guild, msg) => {
  let id = guild.id;
  guild.defaultChannel.sendMessage(`${guild.owner.displayName} Remember to set a NSFW channel by !setnsfw`).catch(console.error);
  var serverInfo = new dbs({
    serverID:id,
    owner:guild.owner.id,
    prefix:"!",
    usesBot:true,
    nswfChannel:0
  });
  serverInfo.save(function (err, serverInfo){
    if (err) return console.error(err);
  }); 
});

//Checks to see if the command has been called
client.on('message', msg => {
  let ids = msg.guild.id;
  dbs.findOne({serverID: ids}, function (err, docs) {
    if (msg.author.id != client.user.id) {
      checkCommand(msg, ids);
    }
  });
});

//Login to discord as a bot
client.login(token).then(atoken => console.log('logged in with token ' + atoken)).catch(console.error);