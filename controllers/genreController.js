var Genre = require('../models/genre');
//const validator = require('express-validator');
const async = require('async');
const Book = require('../models/book');
const {
    body,
    validationResult
} = require('express-validator/check');
const {
    sanitizeBody
} = require('express-validator/filter');

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
    body('name', 'Genre name required').trim().isLength({
        min: 1
    }),


    // Sanitize (escape) the name field.
    sanitizeBody('name').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);
        
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
    }, function (err, results) {
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
                res.render('error', {})
                return;
            }
            res.redirect('/catalog/genres')
        })
    })
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res, next) {
    async.parallel({
            
            genre: function (callback) {
                Genre.findById(req.params.id).exec(callback)
            }
        },
        function (err, results) {
            if (err || results.genre === 'undefined') {
                res.render('error', {})
                return;
            }
            res.render('genre_form', {title : " Update Genre", genre : results.genre})
        })
};

// Handle Genre update on POST.
exports.genre_update_post = [
    body('name', 'Please check the name.').trim().isLength({min : 1}),
    sanitizeBody('name').escape(),
    
    (req, res, next) => {
 
        const errros = validationResult(req);

        var genre = new Genre({
            name : req.body.name,
            _id : req.params.id
        });

        if(!errros.isEmpty()){
            async.parallel({
                genre: function (callback) {
                    Genre.findById(req.params.id).exec(callback)
                }
            }, function(err, results){
                if (err) {
                    return next(err);
                }
                res.render('genre_form', {title: "Update Genre", genre : results.genre, errors : errros.array()})
            })
        }else{
            Genre.findByIdAndUpdate(req.params.id , genre, {}, function (err, thegenre) {
                if (err) {
                    return res.render('error', {})
                }
                res.redirect(thegenre.url)
            })
        }

    }
];