const client = require("./server.js");
const coms = require("./commands.js")
const fs = require('fs');
const path = require('path');

function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function(file) {
        return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
}

exports.init = function(){
    start();
};

function start(){
    var commandCount = 0;
    for (var i = 0; i < coms.commands.length; i++) {
        client.addCommand(coms.commands[i], coms.commands[coms.commands[i]]);
        commandCount++;
    }
    console.log("Loaded " + client.commandCount() + " chat commands")
}