// 3rd party packages
const Telegraf = require('telegraf');
const rp = require('request-promise');
const cheerio = require('cheerio');

// Modules
const utils = require('./modules/utils');
const db = require('./modules/db');

const bot = new Telegraf(process.env.BOT_TOKEN);
const options = {
    uri: `https://www.packtpub.com/packt/offers/free-learning`,
    transform: function(body) {
        return cheerio.load(body);
    }
}

rp(options)
    .then(($) => {
        var bookTitle = $('#title-bar-title').find('h1').text();
    })
    .catch((err) => {
        utils.log("Error occurred during title crawl")
    })

// connect to database
utils.log("Connecting to the database...");
db.connect(function(err) {
    utils.log("Connected to the database!");
});

// Show welcome message on start command
bot.start((ctx) => {
    ctx.reply('Welcome!')
});

// Show help message for commands

// Show stats on the /stats command
bot.hears('/stats', (ctx) => {
    db.getMonthStats(8, function(stats) {
        var message = "";
        stats.forEach(stat => {
            message += stat.technology + ": " + stat.percentage + "%\n";
        });
        ctx.reply(message);
    });
});

// start listening for messages
bot.startPolling();

utils.log("PacktPub Stats Bot is running");