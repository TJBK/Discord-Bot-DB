/*jshint esversion: 6 */
//Needs
const Discord = require("discord.js");
const client = new Discord.Client();
const request = require('request');
const jsdom = require("jsdom");
const toMarkdown = require('to-markdown');
const url = 'http://efukt.com/random.php';
const token = '';

//vars
var title, colour, desc, img, newUrl, isVideo;

//lets
let prefix = "<!";

//Start bot
client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}!`);
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
  console.log(`Title: ${title}
desc: ${desc}
Poster: ${img}`);
}

//Checks to see if the command has been called
client.on('message', msg => {
  if (msg.content === prefix + 'efukt') {
    genNew();
    const embed = new Discord.RichEmbed().setTitle(title).setColor(colour).setDescription(toMarkdown(desc)).setURL(newUrl).setImage(img);
    msg.channel.sendEmbed(embed).catch(console.error);
  }
});

//Login to discord as a bot
client.login(token).then(atoken => console.log('logged in with token ' + atoken)).catch(console.error);