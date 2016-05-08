var crypto = require('crypto')
var express = require("express")
var mongoose = require("mongoose")
var router = express.Router()
var swig = require("swig")

//db
var fs = require('fs')
var config = JSON.parse(fs.readFileSync('./config.json','utf-8'))
var db = mongoose.connect(config.mongodbURL)
db.connection.on("error", function(err) {
    console.log("db connect failed: " + err)
})
db.connection.on('open', function() {
    console.log('db connect success')
})

// doc modals
var models = require("../models/user")

// status dictionary
var statusCodeDictionary = {
    "200": ["登陆成功", true],
    "210": ["账号不存在或密码不正确", false],
    "230": ["登陆失败", false],
    "300": ["验证码已发送", true],
    "310": ["手机号已被注册", false],
    "320": ["验证码正确", true],
    "330": ["验证码不正确", false],
    "340": ["注册成功", true],
    "350": ["注册失败", false],
    "370": ["帐号已存在", false],
}

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", {
        pagename: "awesome people",
        authors: ["Paul", "Jim", "Jane"]
    })
})

router.route("/register").get(function (req, res) {
    //render register
}).post(function (req, res, next) {
    var account = req.body.account
    var password = req.body.password
})

router.route("/login").get(function (req, res) {
    //render login
}).post(function (req, res, next) {
    var account = req.body.account
    var password = req.body.password
})

/* App api */
router.post("/app.register", function (req, res, next) {
    var account = req.body.account
    var password = req.body.password
    console.log("Register -- account: " + account + ", password: " + password)
    models.user_login.find({'_id': account}, function(err, docs) {
        if (err) {
            console.log("register error: " + err)
        } else if (docs.length === 0) {
            // not exist, can register
            console.log("register no error: " + docs)

            // init new user's infos
            var userLogin = new models.user_login({
                _id: account,
                password: password,
            })
            userLogin.save(function (err, docs) {
                if (err) {
                    // register failed
                    console.log("userLogin save failed")
                    res.send(status(350))
                } else {
                    // register success
                    console.log("userLogin save success")
                    res.send(status(340))
                }
            })

            var userInfo = new models.user_info({
                _id: account,
                phone: req.body.phone,
                email: req.body.email,
                nickname: req.body.nickname,
            })
            userInfo.save(function (err, docs) {
                if (err) {
                    // userInfo save failed
                    console.log("userInfo save failed")
                } else {
                    // userInfo save success
                    console.log("userInfo save success")
                }
            })
        } else {
            // already exist
            console.log("already exist")
            res.send(status(370))
        }
    })
})

router.post("/app.login", function (req, res, next) {
    var account = req.body.account
    var password = req.body.password
    console.log("login account: " + account + ", password: " + password)
    models.user_login.find({'_id': account, 'password': password}, function(err, docs) {
        if (err) {
            // login failed
            console.log("login failed")
            res.send(status(230))
        } else {
            // login
            if (docs.length === 0) {
                // user not found
                console.log("user not found")
                res.send(status(210))
            } else {
                // user find
                console.log("user find")
                var userInfo = {

                }
                models.user_info.find({"_id": account}, function(err, docs) {
                    if (docs.length !== 0) {
                        userInfo = {
                            "phone": docs[0]["phone"],
                            "email": docs[0]["email"],
                            "nickname": docs[0]["nickname"]
                        }
                    }
                    res.send({
                        "status": "200",
                        "userInfo": userInfo
                    })
                })
            }
        }
    })
})

function status(code) {
    return {
        "status": code.toString()
    }
}
module.exports = router
