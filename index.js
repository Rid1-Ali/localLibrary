"use strict";

var express = require('express')
var app = express();

var indexRouter = require('./router/index');
var usersRouter = require('./router/users');
var catalogRouter = require('./router/catalog');

app.use('/', indexRouter)
//app.use('/users', usersRouter)
app.use('/catalog', catalogRouter)




app.listen(3000, function () {
    console.log("App listening at 8080");

})