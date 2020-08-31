"use strict";

var express = require('express')
const path = require('path');
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var compression = require('compression');
var helmet = require('helmet')
var app = express();


var pass = '0914719213Md!'
var dev_db_url = "mongodb+srv://ridwan:" + pass + "@library.dkyyv.mongodb.net/library?retryWrites=true&w=majority";
var mongoDB = process.env.MONGODB_URI || dev_db_url
mongoose.connect(mongoDB, {
    useNewUrlParser: true
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '))


var indexRouter = require('./router/index');
var usersRouter = require('./router/users');
var catalogRouter = require('./router/catalog');




app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(compression())
app.use(helmet())
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use('/', indexRouter)
//app.use('/users', usersRouter)
app.use('/catalog', catalogRouter)
app.use('/test', function (req, res) {
    res.render('layout')
})




app.listen(process.env.PORT || 3000, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});