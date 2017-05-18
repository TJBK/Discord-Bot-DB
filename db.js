/*jshint esversion: 6*/
const mongoose = require('mongoose');
const assert = require('assert');
const mongodbURL = 'mongodb://127.0.0.1:27017/botMain';
mongoose.connect(mongodbURL);
global.db = mongoose.connection;
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

global.dbv = mongoose.model('dbv', videoSchema);
global.dbs = mongoose.model('dbs', serverSchema);
