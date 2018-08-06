//------------------------------------------------------------------------------
// Web scrapper module that obtains the information of the free eBook of the day
// on PacktPub and saves it to the database.
//------------------------------------------------------------------------------

// 3rd party packages
const rp = require('request-promise');
const cheerio = require('cheerio');

// Modules
const db = require('./db');
const utils = require('./utils');

const options = {
    uri: `https://www.packtpub.com/packt/offers/free-learning`,
    transform: function(body) {
        return cheerio.load(body);
    }
}

module.exports = {
    getBookOfTheDay: function() {
        rp(options)
            .then(($) => {
                var bookTitle = $('#title-bar-title').find('h1').text();
                var bookObject = {
                    book_title: bookTitle,
                    book_technology: 'Placeholder'
                }

                db.addBook(bookObject, function(id) {
                    utils.log("Added book: " + bookTitle);
                })
            })
            .catch((err) => {
                utils.log("Error occurred while obtaining information of the book of the day")
            })
    }
}