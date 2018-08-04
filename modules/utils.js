// Moment.js library
const moment = require('moment');

module.exports = {
    buildCurrentDate:  function() {
        return moment().format('DD-MM-YYYY HH:mm:ss')
    },

    log: function(message) {
        console.log("[" + this.buildCurrentDate() + "] " + message);
    }
}