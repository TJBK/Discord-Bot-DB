/*jshint esversion: 6*/
const discord = require("discord.js");
const mainBot = require("./server");
const dbcon = require("./db");
const toMarkdown = require('to-markdown');
const request = require('request');
const jsdom = require("jsdom");

exports.commands = {
  "test": {
    usage: "test",
    description: "test",
    process: function(client,msg,suffix,ids) {
			msg.channel.sendMessage('test');
		}
  },
  "ping": {
    description: "Simple ping pong",
    process: function(client,msg,suffix,ids) {
        msg.reply('Pong');
    }
  },
  "setprefix": {
    usage: "command + <newprefix>",
    description: "Set the prefix for the server",
    process: function(client,msg,suffix,ids) {
        dbs.update({serverID: ids}, {$set: {prefix: suffix}}, {multi: true}, function (err, numReplaced) {
          msg.channel.sendMessage(`Your server prefix has been changed to **${suffix}**`).catch(console.error);
        });
    }
  },
  "setnsfw": {
    description: "Set the NSFW channel",
    process: function(client,msg,suffix,ids) {
        dbs.update({serverID: ids}, {$set: {nswfChannel: msg.channel.id}}, {multi: true}, function (err, numReplaced) {
          msg.channel.sendMessage(`This is set to the NSFW channel **${msg.channel.id}**`).catch(console.error);
        });
    }
  },
  "debug": {
    description: "Reset the bot",
    process: function(client,msg,suffix,ids) {
      dbs.update({serverID: ids}, {$set: {nswfChannel: 0}}, {multi: true}, function (err, numReplaced) {
        msg.channel.sendMessage(`${msg.author.username} you have reset the bot`).catch(console.error);
      });
    }
  }
  //Remove the efukt thing since it was just me messing with JSDom
  /*"efukt": {
    description: "Get a video from efukt",
    process: function(client,msg,suffix,ids) {
        if (msg.channel.id === docs.nswfChannel) {
            genNew();
            const embed = new discord.RichEmbed().setTitle(title).setColor(colour).setDescription(toMarkdown(desc)).setURL(newUrl).setImage(img);
            msg.channel.sendEmbed(embed).catch(console.error);
        }
    }
  }*/
};

exports.newVid = function(){
    genNew();
};

var title, colour, desc, img, newUrl, isVideo;

function genNew() {
  const url = 'http://efukt.com/random.php';
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
