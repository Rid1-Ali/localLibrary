var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');
var async = require('async');

const {
    body,
    validationResult
} = require('express-validator/check');
const {
    sanitizeBody
} = require('express-validator/filter');

exports.index = function (req, res) {

    async.parallel({
        book_count: function (callback) {
            Book.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        book_instance_count: function (callback) {
            BookInstance.countDocuments({}, callback);
        },
        book_instance_available_count: function (callback) {
            BookInstance.countDocuments({
                status: 'Available'
            }, callback);
        },
        author_count: function (callback) {
            Author.countDocuments({}, callback);
        },
        genre_count: function (callback) {
            Genre.countDocuments({}, callback);
        }
    }, function (err, results) {
        res.render('index', {
            title: 'Local Library Home',
            error: err,
            data: results
        });
    });
};

// Display list of all books.
exports.book_list = function (req, res) {
    Book.find({}, 'title author')
        .populate('author')
        .exec(function (err, list_books) {
            if (err) {
                return async.nextTick(err)
            }
            res.render('book_list', {
                title: "BookList",
                book_list: list_books
            })
        })

};

// Display detail page for a specific book.
exports.book_detail = function (req, res) {

    async.parallel({
        book: function (callback) {
            Book.findById(req.params.id)
                .populate('genre')
                .populate('author')
                .exec(callback)
        },
        book_instance: function (callback) {
            BookInstance.find({
                'book': req.params.id
            }).exec(callback)
        }
    }, function (err, results) {
        if (err) {
            return next(err)

        }
        if (results.book == null) {
            var err = new Error('Book Not Found');
            err.status = 404;
            next(err)
        }
        res.render('book_detail', {
            title: results.book.title,
            book_detail: results.book,
            book_instances: results.book_instance
        })

    })
};

// Display book create form on GET.
exports.book_create_get = function (req, res) {

    async.parallel({
        authors: function (callback) {
            Author.find(callback)
        },
        genres: function (callback) {
            Genre.find(callback)
        }
    }, function (err, results) {
        if (err) {
            next(err)
        }
        res.render('book_form', {
            title: 'Create Book',
            authors: results.authors,
            genres: results.genres
        })
    })


};

// Handle book create on POST.
exports.book_create_post = [
    (req, res, next) => {
        if (!(req.body.genre === 'undefined')) {
            req.body.genre = [];
        } else {
            req.body.genre = new Array(req.body.genre)
        }
        next();
    },

    body('title', 'Title must not be empty').trim().isLength({
        min: 1
    }),

    body('author', 'Author must not be empty').trim().isLength({
        min: 1
    }),

    body('summary', 'Summary must not be empty').trim().isLength({
        min: 1
    }),

    body('isbn', 'ISBN must not be empty').trim().isLength({
        min: 1
    }),

    sanitizeBody('title').escape(),
    sanitizeBody('author').escape(),
    sanitizeBody('summary').escape(),
    sanitizeBody('isbn').escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        console.log("=========================");
        console.log(req.body.author);

        console.log(req.body.genre.length);
        console.log(req.body.genre[0]);

        console.log("=========================");
        var book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
        })

        if (!errors.isEmpty()) {
            async.parallel({
                authors: function (callback) {
                    Author.find(callback)
                },
                genres: function (callback) {
                    Genre.find(callback)
                }, //s

            }, function (err, results) {

                if (err) {
                    return next(err)
                }

                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked = 'true'
                    }
                }

                res.render('book_form', {
                    title: 'Create Book',
                    authors: results.authors,
                    genres: results.genres,
                    book: book,
                    errors: errors.array()
                })


            })
            return;
        } else {
            book.save();
            res.redirect(book.url)
        }
    }




];

// Display book delete form on GET.
exports.book_delete_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Book update POST');
};