//------------------------------------------------------------------------------
// Bot module that handles all the communication between the bot and the user.
//------------------------------------------------------------------------------

// 3rd party packages
const Telegraf = require('telegraf');
const moment = require('moment');

// Modules
const db = require('./db');

const bot = new Telegraf(process.env.BOT_TOKEN);

var getCurrentMonthStats = function(callback) {
    var currentMonth = moment().format("MM");
    var currentYear = moment().format("YYYY");
    db.getMonthStats(currentMonth, currentYear, function(stats) {
        var message = "";
        stats.forEach(stat => {
            message += stat.technology + ": " + stat.percentage + "%\n";
        });
        callback(message);
    });
}


// Show welcome message on start command
bot.start((ctx) => {
    ctx.reply('Welcome!')
});

// Show help message for commands
// ...

// Listen for different commands
bot.use((ctx, next) => {
    var message = ctx.message.text;
    var splitMsg = message.split(" ");

    // /stats (or /graph?) command
    if (splitMsg.length == 1) {
        // /stats command without any other option - show stats for the current month
        if (splitMsg[0] == "/stats") {
            getCurrentMonthStats(function(message) {
                ctx.reply(message);
            });
        }
        // /graph command without any other option - show graph for the current month
        else if (splitMsg[0] == "/graph") {

        }
    }
})

// Need to set the /stats listener, but the logic will be handled above
bot.hears('/stats', () => {});

module.exports = {
    getBot: function() {
        return bot;
    },

    /**
     * Get the stats for the current month.
     * Used in the daily message sent and in the /stats command.
     */
    sendCurrentMonthStats: function(callback) {
        return getCurrentMonthStats(callback);
    }
}