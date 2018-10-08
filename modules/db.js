//------------------------------------------------------------------------------
// Database module that handles the connection to the database and performs the
// required queries to obtain the information requested by the user.
//------------------------------------------------------------------------------

// 3rd party packages
const mysql = require('mysql');
const _ = require('lodash');

// Modules
const utils = require('./utils');

// Config
const config = require('../config.json');

var con = mysql.createConnection({
    host: config.db.host, // IP of the server where the database is hosted
    user: config.db.user, // username to access database
    password: config.db.password, // password for the user above
    database: config.db.database // database name
})

module.exports = {
    /**
     * Connect to the database
     */
    connect: function(callback) {
        con.connect(function(err) {
            if (err) {
                throw err;
            }
            return callback(err);
        })
    },

    /**
     * Get PacktPub statistics for a given month
     * @param {number} month Month to filter by
     * @param {number} year Year to filter by
     */
    getMonthStats: function(month, year, callback) {
        var daysInMonth = utils.getDaysInMonth(month, year);

        var startDate = `'${year}-${month}-01'`;
        var endDate = `'${year}-${month}-${daysInMonth}'`;

        this.getBookStats(startDate, endDate, function(stats) {
            return callback(stats);
        });
    },

    /**
     * Get PacktPub statistics for a given year
     * @param {number} year Year to filter by
     */
    getYearStats: function(year, callback) {
        var startDate = `'${year}-01-01'`;
        var endDate = `'${year}-12-31'`;

        this.getBookStats(startDate, endDate, function(stats) {
            return callback(stats);
        });
    },

    /**
     * Get PacktPub statistics from a certain range of months (e.g. August 2018 - September 2018)
     * @param {number} startMonth Month to start filtering by
     * @param {number} startYear Year to start filtering by
     * @param {number} endMonth Month to end filtering by
     * @param {number} endYear Year to end filtering by
     */
    getStatsInRange: function(startMonth, startYear, endMonth, endYear, callback) {
        var daysInEndMonth = utils.getDaysInMonth(endMonth, endYear);

        var startDate = `'${startYear}-${startMonth}-01'`;
        var endDate = `'${endYear}-${endMonth}-${daysInEndMonth}'`;

        this.getBookStats(startDate, endDate, function(stats) {
            return callback(stats);
        });
    },

    /**
     * Get PacktPub stats from a certain date range
     * @param {string} startDate Date to start filtering by
     * @param {string} endDate Date to end filtering by
     */
    getBookStats: function(startDate, endDate, callback) {
        var statsArray = [];
        var days;

        con.query(`SELECT * FROM tbl_book WHERE book_date BETWEEN ${startDate} AND ${endDate}`, function(err, result) {
            if (err) {
                throw err;
            }
            
            days = result.length;
        });

        con.query(`SELECT book_technology, COUNT(*) AS count FROM tbl_book WHERE book_date BETWEEN ${startDate} AND ${endDate} GROUP BY book_technology ORDER BY count DESC`, function(err, result) {
            if (err) {
                throw err;
            }
            
            result.forEach(el => {
                var pct = _.round((el.count / days) * 100, 1);
                var statObject = {
                    technology: el.book_technology,
                    percentage: pct
                }
                statsArray.push(statObject);
            });
            return callback(statsArray);
        })
    },

    /**
     * Add a book to the database
     * @param {Object} book Object with the information to add to the book table
     */
    addBook: function(book, callback) {
        con.query("INSERT INTO tbl_book SET ?", book, function(err, results) {
            if (err) {
                throw err;
            }
            return callback(results.insertId);
        })
    },

    /**
     * Check if the latest book inserted in the database is a new one or not
     */
    bookIsNew: function(callback) {
        // get last inserted row
        con.query("SELECT * FROM tbl_book ORDER BY book_id DESC LIMIT 1", function(err, result) {
            if (err) {
                throw err;
            }
            // get rows with the same title
            con.query(`SELECT * FROM tbl_book WHERE book_title = '${result[0].book_title}'`, function(err, results) {
                if (err) {
                    throw err;
                }

                var book = {
                    title: results[0].book_title,
                    occurrences: results.length
                };
                
                return callback(book);
            })
        });
    }
}
