var crypto = require ('crypto')
var express = require("express")
var mongoose = require("mongoose")
var db = mongoose.createConnection("mongodb://IP:PORT/fatherbook")
var router = express.Router()
var swig = require("swig")

// doc modals
var user_login_model = require ("../models/user")[0];
var user_info_model = require ("../models/user")[1];
var user_blog_model = require ("../models/user")[2];
var user_friend_model = require ("../models/user")[3];
var user_apply_model = require ("../models/user")[4];
var user_gallery_model = require("../models/user")[5];
var user_position_model = require("../models/user")[6];

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", {
    pagename: "awesome people",
    authors: ["Paul", "Jim", "Jane"]
  })
})

router.route("/register").get (function(req, res) {
  //render register
}).post(function(req, res, next) {
  var account = req.body.account
  var password = req.body.password
})

router.route("/login").get(function(req, res) {
  //render login
})post(function(req, res, next) {
  var account = req.body.account
  var password = req.body.password
})

/* App api */
router.post("/app.register", function(req, res, next) {
  var account = req.body.account
  var password = req.body.password
})

router.post("/app.login", function(req, res, next) {
  var account = req.body.account
  var password = req.body.password
})

module.exports = router
