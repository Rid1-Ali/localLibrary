"use strict";

var express = require('express')
const path = require('path');
var app = express();


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
    console.log("App listening at 8080");

})