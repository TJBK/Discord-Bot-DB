/*jshint esversion: 6 */
//Needs
const Discord = require("discord.js");
const client = new Discord.Client();
const request = require('request');
const jsdom = require("jsdom");
const toMarkdown = require('to-markdown');
const Datastore = require('nedb');
const url = 'http://efukt.com/random.php';
const token = 'MzA4MDUwMjQ2ODg0MTMwODQw.C-bNqg.GnHk6JO19QkETIP2IJyEHjjOFs8';

//DB
var dbs = new Datastore({ filename: 'server.db', autoload: true });
var dbv = new Datastore({ filename: 'vid.db', autoload: true });
dbs.loadDatabase();
dbv.loadDatabase();

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
  dbv.insert({
    title: title,
    description: desc,
    posterURL: img
  });
}

function checkCommand(msg, ids) {
  dbs.findOne({serverID: ids}, function (err, docs) {
    if (msg.author.id != client.user.id) {
      if (msg.content === docs.prefix + 'efukt') {
        genNew();
        const embed = new Discord.RichEmbed().setTitle(title).setColor(colour).setDescription(toMarkdown(desc)).setURL(newUrl).setImage(img);
        msg.channel.sendEmbed(embed).catch(console.error);
      }
    }
  });
}

client.on('guildCreate', (guild, msg) => {
  let id = guild.id;
  guild.defaultChannel.sendMessage(`${guild.owner.displayName} you need to agree to the bot since it\'s NSFW do /agree`).catch(console.error);
  dbs.insert({
    serverID: id,
    agreed: false,
    prefix: "!",
    usesBot: true
  });
});

//Checks to see if the command has been called
client.on('message', msg => {
  let ids = msg.guild.id;
  dbs.findOne({serverID: ids}, function (err, docs) {
    if (msg.author.id != client.user.id) {
      if (msg.content === docs.prefix + 'agree') {
        dbs.update({serverID: ids}, {$set: {agreed: true}}, {multi: true}, function (err, numReplaced) {
          msg.channel.sendMessage('**YAY** The bot is now active on this server.\nIgnore it asking to get the owner to agree to the bot since I messed up choosing a DB').catch(console.error);
        });
      }
      if (docs.agreed === true) {
        checkCommand(msg, ids);
      }else{
        msg.reply('Please get the server owner to agree to the bot.');
      }
    }
  });
});

//Login to discord as a bot
client.login(token).then(atoken => console.log('logged in with token ' + atoken)).catch(console.error);