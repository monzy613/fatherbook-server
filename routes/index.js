var crypto = require('crypto')
var express = require("express")
var mongoose = require("mongoose")
var router = express.Router()
var swig = require("swig")
var fs = require('fs')
var rongcloudSDK = require( 'rongcloud-sdk' );

//db
var config = JSON.parse(fs.readFileSync('./config.json','utf-8'))
var db = mongoose.connect(config.mongodbURL)
db.connection.on("error", function(err) {
    console.log("db connect failed: " + err)
})
db.connection.on('open', function() {
    console.log('db connect success')
})

//rc
rongcloudSDK.init(config.rcAppkey, config.rcAppSecret);

// doc modals
var models = require("../models/user")

// status dictionary
var statusCodeDictionary = {
    "000": ("Network error", false),
    "200": ("Login Success", true),
    "210": ("Wrong password or account", false),

    "300": ("验证码已发送", true),
    "310": ("手机号已被注册", false),
    "320": ("验证码正确", true),
    "330": ("验证码不正确", false),

    "340": ("Register success", true),
    "350": ("Register failed", false),
    "370": ("Account exist", false),

    "400": ("搜索成功", true),
    "410": ("未找到符合条件的用户", false)
}

String.prototype.isEmpty = function() {
    return this === undefined || this.trim() === ""
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
    var account = req.body.account.toString()
    var password = req.body.password.toString()
    if (account.isEmpty() || password.isEmpty()) {
        return
    }
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
    var account = req.body.account.toString()
    var password = req.body.password.toString()
    if (account.isEmpty() || password.isEmpty()) {
        return
    }
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
                    "account": account
                }
                models.user_info.find({"_id": account}, function(err, docs) {
                    if (docs.length !== 0) {
                        userInfo = {
                            "account": account,
                            "phone": docs[0]["phone"],
                            "email": docs[0]["email"],
                            "nickname": docs[0]["nickname"]
                        }
                    }

                    rongcloudSDK.user.getToken(
                        account,
                        docs[0]["nickname"] === undefined? "defaultNickname": docs[0]["nickname"],
                        "http://www.rongcloud.cn/docs/assets/img/logo_s@2x.png",
                        function(err, resultText) {
                            if( err ) {
                                // Handle the error
                                console.log(err)
                            }
                            else {
                                var result = JSON.parse(resultText);
                                if( result.code === 200 ) {
                                    //Handle the result.token
                                    userInfo.rcToken = result.token
                                    res.send({
                                        "status": "200",
                                        "userInfo": userInfo
                                    })
                                } else {
                                    console.log("result.code not 200")
                                }
                            }
                         });
                })
            }
        }
    })
})

router.post("/app.search.account", function (req, res, next) {
    //app.search.account by acount
    var account = req.body.account.toString()
    models.user_info.find({'_id': new RegExp(account, "i")}, function(err, docs) {
        if (err) {
            console.log("/app.search.account error: " + err)
        } else if (docs.length === 0) {
            res.send({
                "status": "410"
            })
        } else {
            res.send({
                "status": "400",
                "users": docs
            })
        }
    })
})

function status(code) {
    return {
        "status": code.toString()
    }
}

module.exports = router
