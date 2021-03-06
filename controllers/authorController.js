var Author = require('../models/author');
var Book = require('../models/book');
var debug = require('debug')('author');
var async = require('async')
const {
    body,
    validationResult
} = require('express-validator/check');
const {
    sanitizeBody
} = require('express-validator/filter');
const { render } = require('pug');

// Display list of all Authors.
exports.author_list = function (req, res, next) {
    Author.find()
        .populate('author')
        .sort([
            ['family_name', ['ascending']]
        ])
        .exec(function (err, list_authors) {
            if (err) {
                return next(err);
            }
            res.render('author_list', {
                title: 'Author List',
                author_list: list_authors
            })
        })
};

// Display detail page for a specific Author.
exports.author_detail = function (req, res, next) {
    async.parallel({
        author: function (callback) {
            Author.findById(req.params.id)
                .exec(callback);
        },
        books: function (callback) {
            Book.find({
                'author': req.params.id
            }).exec(callback)
        }
    }, function (err, results) {

        if (results.author == null) {
            var err = new Error('Author Not Found!')
            err.status = 404
            debug('Author error:' + err);
            return res.render('error', {
                error: err,
                msg : err
            })
        }
        res.render('author_detail', {
            title: 'Author Detail',
            author: results.author,
            books: results.books
        })
    })

};

// Display Author create form on GET.
exports.author_create_get = function (req, res, next) {
    res.render('author_form', {
        title: 'Create Author'
    })
};

// Handle Author create on POST.
exports.author_create_post = [

    body('first_name').isLength({
        min: 1
    }).trim().withMessage('Family name must be specified.')
    .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),

    body('family_name').isLength({
        min: 1
    }).trim().withMessage('Family name must be specified.')
    .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),

    body('date_of_birth', 'Invalid date of birth').optional({
        checkFalsy: true
    }).isISO8601(),

    body('date_of_death', 'Invalid date of death').optional({
        checkFalsy: true
    }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('first_name').escape(),
    sanitizeBody('family_name').escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),



    function (req, res, next) {

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.render('author_form', {
                title: 'Create Author',
                author: req.body,
                error: errors.array()
            })
        } else {
            var author = new Author({
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death
            });

            author.save(function (err) {

                if (err) {
                    return next(err)
                }
                res.redirect(author.url)

            })
        }


    }
]

// Display Author delete form on GET.
exports.author_delete_get = function (req, res, next) {
    async.parallel({
        author: function (callback) {
            Author.findById(req.params.id)
                .exec(callback);
        },
        author_books: function (callback) {
            Book.find({
                    'author': req.params.id
                })
                .exec(callback);
        }
    }, function (err, results) {
        if (err) {
            return next(next)
        }
        if (results.author == null) {
            res.redirect('/catalog/authors');
        }

        res.render('author_delete', {
            title: 'Delete Author',
            author: results.author,
            author_books: results.author_books
        })
    })
};

// Handle Author delete on POST.
exports.author_delete_post = function (req, res, next) {

    async.parallel({
        author: function (callback) {
            Author.findById(req.body.authorid)
                .exec(callback)
        },
        author_books: function (callback) {
            Author.find({
                    'author': req.body.authorid
                })
                .exec(callback);
        }
    }, function (err, results) {
        if (err) {
            return next(err)
        }
        if (results.author_books.length > 0) {
            res.render('auhtor_delete', {
                title: 'Delete Author',
                author: results.author,
                author_books: results.author_books
            })
            return;
        } else {
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                if (err) {
                    return next(err)
                }
                res.redirect('/catalog/authors')
            })
        }
    })

};

// Display Author update form on GET.
exports.author_update_get = function (req, res, next) {
    async.parallel({
        author: function (callback) {
            Author.findById(req.params.id).exec(callback);
        }
    }, function (err, results) {
        if (err || results.author === 'undefined') {
            return res.render('error', {
                msg: 'Author not found'
            })
        }
        res.render('author_form', {
            title: "Update Author",
            author: results.author
        })
    })
};

// Handle Author update on POST.
exports.author_update_post = [

    body('first_name').trim().isLength({
        min: 1
    }).trim().withMessage('Family name must be specified.')
    .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),

    body('family_name').trim().isLength({
        min: 1
    }).trim().withMessage('Family name must be specified.')
    .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),

    body('date_of_birth', 'Invalid date of birth').optional({
        checkFalsy: true
    }).isISO8601(),

    body('date_of_death', 'Invalid date of death').optional({
        checkFalsy: true
    }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('first_name').escape(),
    sanitizeBody('family_name').escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),


    (req, res, next) => {
        
        const errors = validationResult(req)

        var author = new Author({
            first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death,
                _id : req.params.id
        })

        if(!errors.isEmpty()){
            Author.findById(req.params.id).exec(function(err, result){
                if (err || result === 'undefined') {
                    return render('error', {msg : 'Author not found'})
                }
                return res.render('author_form', {title : 'Update Author', author : result, errors : errors.array()})

            })
        }else{
            Author.findByIdAndUpdate(req.params.id, author, function(err){
                if (err) {
                    return res.render('error', {msg : "error occured on updating"})
                }
                res.redirect(author.url)
            })
        }
        
    }
]