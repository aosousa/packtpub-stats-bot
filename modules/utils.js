// Moment.js library
const moment = require('moment');

module.exports = {
    /**
     * Builds the current date in DD-MM-YYYY HH:mm:ss format using the moment.js library
     */
    buildCurrentDate:  function() {
        return moment().format('DD-MM-YYYY HH:mm:ss')
    },

    /**
     * Logs a message with the current timestamp
     */
    log: function(message) {
        console.log("[" + this.buildCurrentDate() + "] " + message);
    }
}