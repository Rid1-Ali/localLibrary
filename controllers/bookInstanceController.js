var BookInstance = require("../models/bookinstance");
var Book = require("../models/book");
var async = require('async')

const {
    body,
    validationResult
} = require('express-validator/check')
const {
    sanitizeBody
} = require('express-validator/filter')

// Display list of all BookInstances.
exports.bookinstance_list = function (req, res) {
    BookInstance.find()
        .populate('book')
        .exec(function (err, list_bookinstances) {
            if (err) {
                return next(err);
            }
            res.render('bookinstance_list', {
                title: 'Book Instance List',
                bookinstance_list: list_bookinstances
            })
        })
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function (req, res, next) {
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function (err, thebookinstance) {
            if (err) {
                return next(err)
            }
            if (thebookinstance == null) {
                res.render('error')
            }
            res.render('bookinstance_detail', {
                bookinstance: thebookinstance
            })
        })

};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function (req, res, next) {
    Book.find({}, 'title')
        .exec(function (err, books) {
            if (err) {
                return next(err)
            }
            res.render('bookinstance_form', {
                title: 'Create BookInstance',
                book_list: books
            })
        })
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

    body('book', 'Books must be specified').trim().isLength({
        min: 1
    }),
    body('imprint', 'Imprint must be specified').trim().isLength({
        min: 1
    }),
    body('due_back', 'Invalid Date').optional({
        checkFalsy: true
    }).isISO8601(),

    sanitizeBody('book').escape(),
    sanitizeBody('imprint').escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').escape(),

    (req, res, next) => {

        const errors = validationResult(req);

        var bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        });

        if (!errors.isEmpty()) {

            Book.find({}, 'title')
                .exec(function (err, books) {
                    if (err) {
                        return next(err)
                    }

                    res.render('bookinstance_form', {
                        title: 'Create BookInstance',
                        book_list: books,
                        selected_book: bookinstance.book._id,
                        errors: errors.array(),
                        bookinstance: bookinstance
                    });
                });
            return;

        } else {
            bookinstance.save(function (err) {
                if (err) {
                    return next(err)
                }
                res.redirect(bookinstance.url)
            })
        }

    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function (req, res) {
    async.parallel({
        bookinstance: function (callback) {
            BookInstance.findById(req.params.id).populate('book')
                .exec(callback)
        }
    }, function (err, results) {
        res.render('bookinstance_delete', {
            title: 'Delete Bookinstance',
            bookinstance: results.bookinstance
        })
    })



};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function (req, res) {
    async.parallel({
        thebookinstance: function (callback) {
            BookInstance.findById(req.params.id).exec(callback);
        }
    }, function (err, results) {
        if (err || results.thebookinstance === 'undefined') {
            red.render('error', {})
            return;
        }
        BookInstance.findByIdAndRemove(req.params.id, function deleteBookinstance(err) {
            if (err) {
                red.render('error', {})
                return;
            }
            res.redirect('/catalog/bookinstances')
        })
    })
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function (req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function (req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update POST');
}