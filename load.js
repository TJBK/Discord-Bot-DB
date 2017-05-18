/*jshint esversion: 6*/
const client = require("./server.js");
const coms = require("./commands.js");

exports.init = function(){
    start();
};

function start(){
    var commandCount = 0;
    for (var i = 0; i < coms.commands.length; i++) {
        client.addCommand(coms.commands[i], coms.commands[coms.commands[i]]);
        commandCount++;
    }
    console.log("Loaded " + client.commandCount() + " chat commands");
}