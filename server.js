//Needs
const Discord = require("discord.js");
const client = new Discord.Client();
const request = require('request');
const jsdom = require("jsdom");
const toMarkdown = require('to-markdown');
const url = 'http://efukt.com/random.php';

//vars
var title, desc, img;
var newUrl;

//lets
let prefix = "<!";

//Start bot
client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}!`);
  genNew();
});

function genNew() {
  request({
    url: url,
    followRedirect: false
  }, function (err, res, body) {
    newUrl = res.headers.location;
    console.log(newUrl);
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

function getNeeds() {
  title = document.querySelector('.title').textContent;
  desc = document.querySelector('.desc').innerHTML;
  if (document.querySelector('#efukt_video')) {
    img = document.querySelector('#efukt_video').getAttribute('poster');
    console.log("Yes it's a video");
  } else {
    img = document.querySelector('.image_content').src;
    console.log("Not a video");
  }
  console.log(`Title: ${title}
desc: ${desc}
Poster: ${img}`)
}

client.on('message', msg => {
  if (msg.content === prefix + 'efukt') {
    genNew();
    const embed = new Discord.RichEmbed().setTitle(title).setColor("#ffffff").setDescription(toMarkdown(desc)).setURL(newUrl).setImage(img);
    msg.channel.sendEmbed(embed);
  };
});

client.login('MzAxOTEzMzE1NDgyMDA5NjAw.C9B6Mg.ugzvbW7QqQT1sJkqmWv7EOoQNCA');