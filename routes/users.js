var express = require('express');
var router = express.Router();
var fs = require('fs')
var cfg = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log("users");
  res.send('respond with a resource');
});

module.exports = router;
