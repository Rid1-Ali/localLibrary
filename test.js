var mongoose = require('mongoose');
var express = require('express')
var bodyParser = require('body-parser')
var Book = require("./book.model")
var Book = require("./book.model")
var app = express();
Schema = mongoose.Schema
let EmailModel = require("./models/email")
let Database = require("./src/database")

let msg = new EmailModel({
    email: "ram2@GMAIL.com"
})

/* msg.save()
    .then(doc => {
        console.log(doc);
    })
    .catch(err => {
        console.error(err)
    }) */

/* EmailModel.find({
    'email': 'ram@gmail.com'
}, 'email', function (err, emails) {
    if (err) {
        return handleError(err);

    }
    console.log("Search results");

    console.log(emails);

}) */

/* var query = EmailModel.find()
query.select('email')

query.exec(function (err, mails) {
    if (err) {
        return handleError(err);

    }
    console.log("Search results");

    console.log(mails);
}) */


var authorSchema = Schema({
    name: String,
    stories: [{
        type: Schema.Types.ObjectId,
        ref: 'Story'
    }]
});

var storySchema = Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Author'
    },
    title: String
});

var Story = mongoose.model('Story', storySchema);
var Author = mongoose.model('Author', authorSchema);


var bob = new Author({name: 'Bob Smith'})

bob.save(function (err, added) {
    if (err) {
        return handleErroe(err)
    }else{
        console.log(added);
        
    }

    var story = new Story({
        title: "Bob goes sledding",
        author: bob._id
    })

    story.save(function (err, stry) {
        if (err) {
            return handleErroe(err)
        }else{
            console.log(stry);
        }

    })
})


app.listen(8080, function () {
    console.log("App listening at 8080");

})