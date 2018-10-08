//------------------------------------------------------------------------------
// Bot module that handles all the communication between the bot and the user.
//------------------------------------------------------------------------------

// 3rd party packages
const Telegraf = require('telegraf');
const moment = require('moment');

// Modules
const db = require('./db');

// Config
const config = require('../config.json');

const bot = new Telegraf(config.bot.token);

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

var getBookOccurrences = function(callback) {
    db.bookIsNew(function(book) {
        var message;
        
        if (book.occurrences === 1) {
            message = `Book "${book.title}" is new!`;
        }
        else {
            message = `Book "${book.title}" is not new! Number of appearances: ${book.occurrences}`;
        }

        callback(message);
    });
}

// Show welcome message on start command
bot.start((ctx) => {
    ctx.reply('Welcome!')
});

// Show help message for commands
bot.help((ctx) => {
    ctx.reply("PacktPub Stats Bot\n")
})

// Listen for different commands
bot.use((ctx, next) => {
    var message = ctx.message.text;
    var splitMsg = message.split(" ");

    // /stats (or /graph ?) or isnew command
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
        // /isnew - check if the latest book added to the database is a new one
        else if (splitMsg[0] == "/isnew") {
            getBookOccurrences(function(message) {
                ctx.reply(message);
            });
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
            // /stats <month> <year> <-> <month> <year> command - show stats for that month and year (e.g. /stats August 2018 - September 2018)
            else if (splitMsg.length == 6) {
                var startMonthNum = months.indexOf(splitMsg[1]);
                var startYear = splitMsg[2];

                var endMonthNum = months.indexOf(splitMsg[4]);
                var endYear = splitMsg[5];

                if (startMonthNum == -1 || endMonthNum == -1) {
                    ctx.reply("ERROR: Invalid month.");
                    return;
                }

                if (isNaN(startYear) || isNaN(endYear)) {
                    ctx.reply("ERROR: Year must be a number.");
                    return;
                }

                db.getStatsInRange(startMonthNum + 1, startYear, endMonthNum + 1, endYear, function(stats) {
                    var message = `PacktPub stats from ${splitMsg[1]} ${splitMsg[2]} to ${splitMsg[4]} ${splitMsg[5]}:\n`;
                    if (stats.length > 0) {
                        stats.forEach(stat => {
                            message += `* ${stat.technology}: ${stat.percentage}%\n`;
                        });
                    }
                    else {
                        message = `No results found from ${splitMsg[1]} ${splitMsg[2]} to ${splitMsg[4]} ${splitMsg[5]}`;
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
    },

    sendBookOccurrences: function(callback) {
        return getBookOccurrences(callback);
    }
}