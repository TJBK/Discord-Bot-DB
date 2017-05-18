/*jshint esversion: 6 */
//Needs
const discord = require("discord.js");
const client = new discord.Client();
const load = require("./load")
const dbcon = require("./db");
const co = require("./commands");
const token = 'MzA4MDUwMjQ2ODg0MTMwODQw.C-bNqg.GnHk6JO19QkETIP2IJyEHjjOFs8';
var cmd = [];

//lets
//let prefix = "<!";

//Start bot
client.on('ready', () => {
  client.user.setGame("DO !help");
  console.log(`Logged in as ${client.user.username}! We are currently serving ${client.guilds.array().length} servers.`);
  /* Disabled efukt is broken
  co.newVid();
  */
});

//Get a new image/video from efukt


function checkCommand(msg, ids) {
  dbs.findOne({serverID: ids}, function (err, docs) {
    const pre = docs.prefix;
    if (msg.author.id != client.user.id && (msg.content.startsWith(pre))) {
      var cmdTXT = msg.content.split(' ')[0].substring(pre.length);
      var suffix = msg.content.substring(cmdTXT.length+pre.length+1);
      var cmd = co.commands[cmdTXT];

      if (cmdTXT === "help") {
        let cmds = suffix.split(" ").filter(function(cmd){return commands[cmd]});
        let cmd = cmds[i];
        var info = 
      }

      if (cmd) {
        try {
          cmd.process(client,msg,suffix,ids,docs);
        } catch(e) {
					var msgTxt = "command " + cmdTXT + " failed :(";
          msgTxt += "\n" + e.stack;
					msg.channel.sendMessage(msgTxt);
        }
      }

      if (msg.isMentioned(client.user)) {
        try {
          cmdTXT = msg.content.split(" ")[1];
          suffix = msg.content.substring(bot.user.mention().length+cmdTXT.length+pre.length+1);
        } catch(e) {
          msg.channel.sendMessage('You called?');
          return;
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

exports.addCommand = function(commandName, commandObject){
  try {
    commands[commandName] = commandObject;
  } catch(err){
    console.log(err);
  }
}

exports.commandCount = function(){
    return Object.keys(commands).length;
}


//Login to discord as a bot
client.login(token).then(atoken => console.log('logged in with token ' + atoken)).catch(console.error);