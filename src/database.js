let mongoose = require('mongoose');

const server = "mongodb://127.0.0.1:27017/test"


class Database {
  constructor() {
    this._connect()
  }
  
_connect() {
     mongoose.connect(server)
       .then(() => {
         console.log('Database connection successful')
       })
       .catch(err => {
         console.error('Database connection error')
         console.log(err);
         
       })
  }
}

module.exports = new Database()