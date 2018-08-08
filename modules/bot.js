//------------------------------------------------------------------------------
// Bot module that handles all the communication between the bot and the user.
//------------------------------------------------------------------------------

// 3rd party packages
const Telegraf = require('telegraf');
const moment = require('moment');

// Modules
const db = require('./db');

const bot = new Telegraf(process.env.BOT_TOKEN);

var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var getCurrentMonthStats = function(callback) {
    var currentMonth = moment().format("MM");
    var currentYear = moment().format("YYYY");
    db.getMonthStats(currentMonth, currentYear, function(stats) {
        var message = "PacktPub stats of the current month:\n";
        stats.forEach(stat => {
            message += `* ${stat.technology}: ${stat.percentage}%\n`;
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

    // /stats (or /graph ?) command
    if (splitMsg.length == 1) {
        // /stats command without any other option - show stats for the current month
        if (splitMsg[0] == "/stats") {
            getCurrentMonthStats(function(message) {
                ctx.reply(message);
            });
        }
        // /graph command without any other option - show graph for the current month
        else if (splitMsg[0] == "/graph") {
            ctx.reply("test")
        }
        // otherwise show error + help message
        else {
            ctx.reply("ERROR: Invalid command.");
        }
    }
    // /stats (or /graph ?) commands with further options
    else if (splitMsg.length > 1) {
        // handle /stats commands
        if (splitMsg[0] == "/stats") {
            // /stats <month> command - show stats for that month in the current year (e.g. /stats August)
            if (splitMsg.length == 2) {
                var firstParam = parseInt(splitMsg[1]);
                // received month - /stats <month> command: show stats for that month in the current year (e.g. /stats August)
                if (isNaN(firstParam)) {
                    var monthNum = months.indexOf(splitMsg[1]);
                    if (monthNum == -1) {
                        ctx.reply("ERROR: Invalid month.");
                        return;
                    }
                    
                    var currentYear = moment().format("YYYY");

                    db.getMonthStats(monthNum + 1, currentYear, function(stats) {
                        var message = `PacktPub stats of ${splitMsg[1]} ${currentYear}:\n`;
                        if (stats.length > 0) {
                            stats.forEach(stat => {
                                message += `* ${stat.technology}: ${stat.percentage}%\n`;
                            });
                        }
                        else {
                            message = `No results found for ${splitMsg[1]} ${currentYear}`;
                        }
                        ctx.reply(message);
                    });
                }
                // otherwise, received year - /stats <year> command: show stats for that year (e.g. /stats 2018)
                else {
                    db.getYearStats(splitMsg[1], function(stats) {
                        var message = `PacktPub stats of ${splitMsg[1]}:\n`;
                        if (stats.length > 0) {
                            stats.forEach(stat => {
                                message += `* ${stat.technology}: ${stat.percentage}%\n`;
                            });
                        }
                        else {
                            message = `No results found for ${splitMsg[1]}`;
                        }
                        ctx.reply(message);
                    });
                }
            }
            // /stats <month> <year> command - show stats for that month and year (e.g. /stats August 2018)
            else if (splitMsg.length == 3) {
                var monthNum = months.indexOf(splitMsg[1]);
                if (monthNum == -1) {
                    ctx.reply("ERROR: Invalid month.");
                    return;
                }

                db.getMonthStats(monthNum + 1, splitMsg[2], function(stats) {
                    var message = `PacktPub stats of ${splitMsg[1]} ${splitMsg[2]}\n`;
                    if (stats.length > 0) {
                        stats.forEach(stat => {
                            message += `* ${stat.technology}: ${stat.percentage}%\n`;
                        });
                    }
                    else {
                        message = `No results found for ${splitMsg[1]} ${splitMsg[2]}`;
                    }
                    ctx.reply(message);
                });
            }
        }
        // handle /graph commands
        else if (splitMsg[0] == "/graph") {

        }
        // otherwise show error + help message
        else {
            ctx.reply("ERROR: Invalid command.");
        }
    }
})

// Error handler - temporary
bot.catch((err) => {
    console.log(err)
})

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