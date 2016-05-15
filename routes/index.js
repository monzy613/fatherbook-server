var crypto = require('crypto')
var express = require("express")
var mongoose = require("mongoose")
var router = express.Router()
var swig = require("swig")
var fs = require('fs')
var rongcloudSDK = require('rongcloud-sdk');

//db
var config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))
var db = mongoose.connect(config.mongodbURL)
db.connection.on("error", function (err) {
    console.log("db connect failed: " + err)
})
db.connection.on('open', function () {
    console.log('db connect success')
})

//rc
rongcloudSDK.init(config.rcAppkey, config.rcAppSecret);

// doc modals
var models = require("../models/user")

// status dictionary

/**
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
    "410": ("未找到符合条件的用户", false),

    "500": ("关注成功", true),
    "510": ("关注失败", false),
    "520": ("取消关注成功", true),
    "530": ("取消关注失败", false),
    "540": ("获取关注列表成功", true),
    "550": ("获取关注列表失败", false)
}
 */

String.prototype.isEmpty = function () {
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
    models.user_login.find({'_id': account}, function (err, docs) {
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
                    // register failedR
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
                nickname: req.body.nickname === undefined ? req.body.account : req.body.nickname,
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
    models.user_login.find({'_id': account, 'password': password}, function (err, docs) {
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
                models.user_info.find({_id: account}, function (err, docs) {
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
                        docs[0]["nickname"] === undefined ? "defaultNickname" : docs[0]["nickname"],
                        "http://www.rongcloud.cn/docs/assets/img/logo_s@2x.png",
                        function (err, resultText) {
                            if (err) {
                                // Handle the error
                                console.log(err)
                            }
                            else {
                                var result = JSON.parse(resultText);
                                if (result.code === 200) {
                                    //Handle the result.token
                                    userInfo.rcToken = result.token
                                    queryFollowing(account, function(arr){
                                        //onSuccess
                                        res.send({
                                            "status": "200",
                                            "userInfo": userInfo,
                                            "follow_infos": arr
                                        })
                                    }, function(){
                                        //onFailed
                                        res.send(status(210))
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
    var searchString = req.body.searchString.toString()
    models.user_info.find({'_id': new RegExp(searchString, "i")}, function (err, docs) {
        if (err) {
            console.log("/app.search.account error: " + err)
        } else {
            for (var i = 0; i < docs.length; i += 1) {
                if (docs[i]._id === account) {
                    docs.splice(i, 1)
                    break
                }
            }
            if (docs.length === 0) {
                res.send({
                    "status": "410"
                })
                return
            }
            res.send({
                "status": "400",
                "users": docs
            })

        }
    })
})


/*
 * follow_info = {
 *   _id: {type: UserInfo},
 *   "type": {type: Int}// 1 one way, 2  two way
 * }
 * */

router.post("/app.friend.following", function (req, res, next) {
    var account = req.body.account.toString()
    queryFollowing(account, function(arr){
        //onSuccess
        res.send({
            "status": "540",
            "follow_infos": arr
        })
    }, function(){
        //onFailed
        res.send(status(550))
    })
})

function queryFollowing(account, onSuccess, onFailed) {
    models.user_following.find({_id: account}, function (err, docs) {
        if (err || docs.length === 0) {
            onFailed()
            return
        }
        models.user_info.find({_id: {$in: getIDArray(docs[0].follow_infos)}}, function (err2, docs2) {
            if (err2 || docs2.length === 0) {
                onFailed()
                return
            }
            var arr = docs2.map(function(ele) {
                ele.set("type", getFollowTypeByID(ele._id, docs[0].follow_infos), {strict: false})
                return ele
            })
            onSuccess(arr)
        })
    })
}

router.post("/app.friend.unfollow", function(req, res, next) {
    var account = req.body.account.toString()
    var targetID = req.body.targetID.toString()
    models.user_following.find({_id: {$in: [account, targetID]}}, function (err, docs) {
        if (err || docs.length === 0) {
            console.log("app.friend.unfollow failed: " + err)
            res.send(status(530))
            return
        }
        var follow_infos = []
        if (docs.length === 1) {
            follow_infos = docs[0].follow_infos
        } else {
            var accountIndex = (docs[0]._id === account? 0: 1)
            var targetIndex = (docs[0]._id === targetID? 0: 1)
            follow_infos = docs[accountIndex].follow_infos
            var target_follow_infos = docs[targetIndex].follow_infos
            for (var t = 0; t < target_follow_infos.length; t += 1) {
                if (target_follow_infos[t]._id === account && target_follow_infos[t].type === 2) {
                    target_follow_infos[t].type = 1
                    models.user_following.update({_id: targetID}, {$set: {follow_infos: target_follow_infos}}, function(err, docs){})
                    break
                }
            }
        }
        for (var i = 0; i < follow_infos.length; i += 1) {
            if (follow_infos[i]._id === targetID) {
                follow_infos.splice(i, 1)
                break
            }
        }
        models.user_following.update({_id: account}, {$set: {follow_infos: follow_infos}}, function(err, docs){
            if (err) {
                console.log("unfollow failed")
                res.send(status(530))
            } else {
                res.send(status(520))
            }
        })
    })
})

router.post("/app.friend.follow", function (req, res, next) {
    var account = req.body.account.toString()
    var targetID = req.body.targetID.toString()
    models.user_following.find({_id: account}, function (err, docs) {
        if (err) {
            console.log("user_following.find error: " + err)
        } else {
            if (docs.length !== 0) {
                var follow_infos = docs[0].follow_infos
                for (var i = 0; i < follow_infos.length; i += 1) {
                    if (follow_infos[i]._id === targetID) {
                        res.send(status(510))
                        return
                    }
                }
            }

            models.user_following.find({_id: targetID}, function (target_err, target_docs) {
                var type = 1
                if (target_err) {
                    console.log("err " + err)
                } else if (target_docs.length !== 0) {
                    var target_follow_infos = target_docs[0].follow_infos
                    for (var i = 0; i < target_follow_infos.length; i += 1) {
                        if (target_follow_infos[i]._id === account) {
                            target_follow_infos[i].type = 2;
                            type = 2
                            models.user_following.update({_id: targetID}, {$set: {follow_infos: target_follow_infos}}, function(err, docs){})
                            break
                        }
                    }
                }

                if (docs.length === 0) {
                    var follow_infos = []
                    follow_infos.push({
                        _id: targetID,
                        type: type
                    })
                    var userFollow = new models.user_following({
                        _id: account,
                        follow_infos: follow_infos
                    })
                    userFollow.save(function (err, docs) {
                        if (err) {
                            console.log(err)
                            res.send(status(510))
                        } else {
                            res.send(status(500))
                        }
                    })
                } else {
                    var follow_infos = docs[0].follow_infos
                    follow_infos.push({
                        _id: targetID,
                        type: type
                    })
                    models.user_following.update({_id: account}, {$set: {follow_infos: follow_infos}}, function(err, docs) {
                        if (err) {
                            console.log(err)
                            res.send(status(510))
                        } else {
                            res.send(status(500))
                        }
                    })
                }
            })
        }
    })
})

function status(code) {
    return {
        "status": code.toString()
    }
}

function getIDArray(follow_infos) {
    var IDs = []
    for (var i = 0; i < follow_infos.length; i += 1) {
        IDs.push(follow_infos[i]._id)
    }
    return IDs
}

function getFollowTypeByID(id, follow_infos) {
    var type = 0
    for (var i = 0; i < follow_infos.length; i += 1) {
        if (follow_infos[i]._id === id) {
            type = follow_infos[i].type
            break
        }
    }
    return type
}

module.exports = router
