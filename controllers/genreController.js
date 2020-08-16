var Genre = require('../models/genre');
const validator = require('express-validator');
const async = require('async');
const Book = require('../models/book');
var ObjectId = require('mongoose').Types.ObjectId;


// Display list of all Genre.
exports.genre_list = function (req, res) {
    Genre.find()
        .exec(function (err, list_genre) {
            if (err) {
                next(err);
            }
            res.render('genre_list', {
                title: 'Genre List',
                genre_list: list_genre
            })
        })
};

// Display detail page for a specific Genre.
exports.genre_detail = function (req, res) {
    Genre.findById(req.params.id).exec(
        function (err, theGenre) {
            if (err) {
                return next(err)
            }
            res.render('genre_detail', {
                title: 'Genre Detail',
                genre: theGenre
            })
        }
    )
};

// Display Genre create form on GET.
exports.genre_create_get = function (req, res) {
    res.render('genre_form', {
        title: 'Create Genre'

    })

};

// Handle Genre create on POST.
exports.genre_create_post = [

    // Validate that the name field is not empty.
    validator.body('name', 'Genre name required').trim().isLength({
        min: 1
    }),


    // Sanitize (escape) the name field.
    validator.sanitizeBody('name').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validator.validationResult(req);
        console.log("---------");
        console.log(req.body);
        console.log("---------");
        // Create a genre object with escaped and trimmed data.
        var genre = new Genre({
            name: req.body.name
        });


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('genre_form', {
                title: 'Create Genre',
                genre: genre,
                errors: errors.array()
            });
            return;
        } else {
            // Data from form is valid.
            // Check if Genre with same name already exists.
            Genre.findOne({
                    'name': req.body.name
                })
                .exec(function (err, found_genre) {
                    if (err) {
                        return next(err);
                    }

                    if (found_genre) {
                        // Genre exists, redirect to its detail page.
                        res.redirect(found_genre.url);
                    } else {

                        genre.save(function (err) {
                            if (err) {
                                return next(err);
                            }
                            // Genre saved. Redirect to genre detail page.
                            res.redirect(genre.url);
                        });

                    }

                });
        }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res, next) {
    async.parallel({
        genre: function (callback) {
            Genre.findById(req.params.id).exec(callback);
        },
        books: function (callback) {
            Book.find({
                genre: new ObjectId(req.params.id)
            }).populate('genre').exec(callback)
        }
    }, function (err, results) {
        if (err || results.genre === 'undefined' || results.books === 'undefined') {
            res.render('error', {})
            return;
        }
        res.render('genre_delete', {
            title: 'Delete Genre',
            genre: results.genre,
            books: results.books
        })

    })
};

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res, next) {
    async.parallel({
        genre: function (callback) {
            Genre.findById(req.params.id).exec(callback);
        },
        books: function (callback) {
            Book.find({
                genre: new ObjectId(req.params.id)
            }).populate('genre').exec(callback)
        }
    }, function(err, results){
        if (err) {
            res.render('error', {});
            return;
        }
        if (results.books.length != 0) {
            res.render('genre_delete', {
                title: 'Delete Genre',
                genre: results.genre,
                books: results.books
            });
            return;
        }
        Genre.findByIdAndRemove(req.params.id, function deleteGenre(err) {
            if (err) {
                red.render('error', {})
                return;
            }
            res.redirect('/catalog/genres')
        })
    })
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};