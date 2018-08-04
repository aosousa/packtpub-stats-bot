const mysql = require('mysql');
const _ = require('lodash');

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
     */
    getMonthStats: function(month, callback) {
        var totalRows;
        var statsArray = [];

        con.query("SELECT book_technology, COUNT(*) AS count FROM tbl_book GROUP BY book_technology", function(err, result) {
            if (err) {
                throw err;
            }

            totalRows = result.length;
            
            result.forEach(el => {
                var pct = _.round((el.count / totalRows) * 100, 1);
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
