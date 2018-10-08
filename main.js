// 3rd party packages
const cron = require('cron-job-manager');

// Modules
const utils = require('./modules/utils');
const db = require('./modules/db');
const scrapper = require('./modules/scrapper');
const botModule = require('./modules/bot');

var bot = botModule.getBot();

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

// Send both stats and isnew message every day at 10:01 AM UTC
manager.add('sendMessage', '00 01 10 * * *', function() {
    // stats message
    botModule.sendCurrentMonthStats(function (message) {
        bot.telegram.sendMessage('-298459952', message).then(function(result) {
            utils.log("Stats message sent successfully");
        });
    });

    // isnew message
    botModule.sendBookOccurrences(function (message) {
        bot.telegram.sendMessage('-298459952', message).then(function(result) {
            utils.log("Is new book message sent successfully");
        });
    });
});

// connect to database
utils.log("Connecting to the database...");
db.connect(function(err) {
    utils.log("Connected to the database!");
});

// start listening for messages
bot.startPolling();
utils.log("PacktPub Stats Bot is running");

// start cron job manager
utils.log("Cron jobs are running");
manager.start('updateDB');
manager.start('sendMessage');