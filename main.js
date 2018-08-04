// 3rd party packages
const Telegraf = require('telegraf');
const cron = require('cron-job-manager');

// Modules
const utils = require('./modules/utils');
const db = require('./modules/db');
const scrapper = require('./modules/scrapper');

const bot = new Telegraf(process.env.BOT_TOKEN);

/**
 * Update database every day at 10:00 AM UTC
 * Cron Job structure: 
 * Seconds: 00-59 (replace with * to run every second)
 * Minutes: 00-59 (replace with * to run every minute)
 * Hours: 00-23 (replace with * to run every hour)
 * Day of the month: 01-31 (replace with * to run every day of the month)
 * Month: 00-11 (replace with * to run every month)
 * Day of the week: 0-6 (replace with * to run every day of the week)
 */
manager = new cron('updateDB', '00 00 10 * * *', function() {
    scrapper.getBookOfTheDay();
});

// Send message every day at 10:01 AM UTC
manager.add('sendMessage', '00 01 10 * * *', function() {

});

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

/*bot.use((ctx, next) => {
    console.log(ctx.message);
})*/

// start listening for messages
bot.startPolling();
utils.log("PacktPub Stats Bot is running");

// start cron job manager
utils.log("Cron jobs are running");
manager.start('updateDB');
manager.start('sendMessage');