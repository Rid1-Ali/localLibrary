"use strict";

var express = require('express')
const path = require('path');
var mongoose = require('mongoose')
var app = express();


var pass = '0914719213Md!'
var mongoDB = "mongodb+srv://ridwan:" + pass + "@library.dkyyv.mongodb.net/library?retryWrites=true&w=majority";
mongoose.connect(mongoDB, {
    useNewUrlParser: true
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '))


var indexRouter = require('./router/index');
var usersRouter = require('./router/users');
var catalogRouter = require('./router/catalog');



app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use('/', indexRouter)
//app.use('/users', usersRouter)
app.use('/catalog', catalogRouter)
app.use('/test', function (req, res) {
    res.render('layout')
})




app.listen(3000, function () {
    console.log("App listening at 3000");

})