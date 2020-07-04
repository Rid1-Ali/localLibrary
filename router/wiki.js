const express = require('express')
const router = express.Router();

router.get('/',function (req, res) {
    res.send('Wiki Homepage')
})

router.get("/about", function (req, res) {
    res.send('About this wiki');
})

/* router.get("/about*", function (req, res) {
    res.send('About this wiki and some jumble thing');
}) */

router.get("/about/:user", function (req, res) {
    res.send('About this wiki and user ' + req.params.user);
})

module.exports = router;