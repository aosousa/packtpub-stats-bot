//------------------------------------------------------------------------------
// Database module that handles the connection to the database and performs the
// required queries to obtain the information requested by the user.
//------------------------------------------------------------------------------

// 3rd party packages
const mysql = require('mysql');
const _ = require('lodash');

// Modules
const utils = require('./utils');

var con = mysql.createConnection({
    host: '', // IP of the server where the database is hosted
    user: '', // username to access database
    password: '', // password for the user above
    database: '' // database name
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
        var statsArray = [];
        var days;

        var startDate = `'${year}-${month}-01'`;
        var endDate = `'${year}-${month}-${daysInMonth}'`;

        con.query(`SELECT * FROM tbl_book WHERE book_date BETWEEN ${startDate} AND ${endDate}`, function(err, result) {
            if (err) {
                throw err;
            }

            days = result.length;
        })

        con.query(`SELECT book_technology, COUNT(*) AS count FROM tbl_book WHERE book_date BETWEEN ${startDate} AND ${endDate} GROUP BY book_technology `, function(err, result) {
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
    }
}
