//------------------------------------------------------------------------------
// Utilities module that contains useful re-usable methods
//------------------------------------------------------------------------------

// Moment.js library
const moment = require('moment');

module.exports = {
    /**
     * Builds the current date in DD-MM-YYYY HH:mm:ss format using the moment.js library
     * @return {string} Date in DD-MM-YYYY HH:mm:ss format
     */
    buildCurrentDate: function() {
        return moment().format('DD-MM-YYYY HH:mm:ss')
    },

    /**
     * Get days in a given month of a year
     * @param {number} month Number of the month
     * @param {number} year Year
     * @return {number} Number of days in the month received
     */
    getDaysInMonth: function(month, year) {
        var month = year + "-" + month;
        return moment(month, "YYYY-MM").daysInMonth();
    },

    /**
     * Logs a message with the current timestamp
     */
    log: function(message) {
        console.log("[" + this.buildCurrentDate() + "] " + message);
    }
}