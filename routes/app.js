var crypto = require('crypto')
var express = require("express")
var router = express.Router()
var swig = require("swig")
var rongcloudSDK = require('rongcloud-sdk');
var config = require("../util/config")
var mongoose = require("mongoose")

//db
var db = require("../util/db")

//rc
rongcloudSDK.init(config.rcAppkey, config.rcAppSecret);

//qn
var fbqn = require("../util/fbqiniu")

// doc modal
var models = require("../models/user")

// status dictionary

/**
var statusCodeDictionary = {
    "000": ("Network error", false),
    "100": ("Get RC Token Success", true),
    "110": ("Get RC Token Failed", false),
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
    "550": ("获取关注列表失败", false),

    "600": ("timeline 发送成功", true),
    "610": ("timeline 发送失败", false),
    "620": ("timeline 获取成功", true),
    "630": ("timeline 获取失败", false),
    "650": ("查无此人", false),

    "640": ("点赞成功", true),
    "650": ("点赞失败", false),
    "660": ("取消点赞成功", true),
    "670": ("取消点赞失败", false),

    "700": ("请求头像token成功", true),
    "710": ("请求头像token失败", false)
}
 */

String.prototype.isEmpty = function () {
    return this === undefined || this.trim() === ""
}

Date.timeStamp = function() {
    var time = new Date().getTime()
    return Math.floor(time / 1000)
}

/* GET home page. */
router.get("/", function (req, res, next) {
    res.send("/")
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
                isDefaultAvatar: true
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
                    if (err || docs.length === 0) {
                        res.send(status(210));
                        return
                    }
                    queryFollowing(account, function(arr){
                        //onSuccess
                        userInfo = {
                            account: account,
                            phone: docs[0]["phone"],
                            email: docs[0]["email"],
                            nickname: docs[0]["nickname"],
                            avatarURL: docs[0]["avatarURL"],
                            isDefaultAvatar: docs[0]["isDefaultAvatar"],
                            follow_infos: arr
                        }
                        res.send({
                            "status": "200",
                            "userInfo": userInfo,
                            "config": {
                                "rcAppkey": config.rcAppkey,
                                "rcAppSecret": config.rcAppSecret,
                                "qnBucketDomain": config.qnBucketDomain
                            }
                        })
                    }, function(){
                        //onFailed
                        console.log("onFailed")
                        res.send(status(210))
                    })
                })
            }
        }
    })
})

router.post("/app.changeavatar", function(req, res, next) {
    var account = req.body.account.toString()
    models.user_info.find({'_id': account}, function(err, docs) {
        if (err || docs.length === 0) {
            res.send(status(710))
        } else {
            var filename = fbqn.avatarPrefix + "/" + account + ".jpeg"
            models.user_info.update({'_id': account}, {$set: {avatarURL: filename, isDefaultAvatar: false}}, function(updateAvatarErr, updateAvatarDocs) {})
            res.send({
                status: "700",
                token: fbqn.getUploadInfo(filename),
                filename: filename
            })
        }
    })
})

router.post("/app.rongcloud.token", function (req, res, next) {
    // /app.rongcloud.token
    var account = req.body.account.toString()
    models.user_info.find({'_id': account}, function (err, docs) {
        if (err || docs.length === 0) {
            res.send(status(110))
        } else {
            rongcloudSDK.user.getToken(
                account,
                docs[0]["nickname"] === undefined ? "defaultNickname" : docs[0]["nickname"],
                "http://www.rongcloud.cn/docs/assets/img/logo_s@2x.png",
                function (err, resultText) {
                    if (err) {
                        // Handle the error
                        console.log(err)
                        res.send(status(110))
                    } else {
                        var result = JSON.parse(resultText);
                        if (result.code === 200) {
                            //Handle the result.token
                            var rcToken = result.token
                            res.send({
                                "status": "100",
                                "rcToken": rcToken
                            })
                        } else {
                            console.log("result.code not 200")
                            res.send(status(110))
                        }
                    }
                });
        }
    })
})

router.post("/app.search.account", function (req, res, next) {
    // /app.search.account by acount
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
                    follow_infos = docs[0].follow_infos
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

/*
 account: {type: String},
 images: {type: Array},
 text: {type: String},
 timeStamp: {type: String},
 repostCount: {type: String},
 isRepost: {type: Boolean},
 sourceTimeline: {type: {}},
 comments: {type: Array},
 liked: {type: Array}
* */
router.post("/app.timeline.post", function(req, res, next) {
    var account = req.body.account.toString()
    var password = req.body.password.toString()
    models.user_info.find({_id: account}, function(err, docs) {
        if (err || docs.length === 0) {
            console.log(err)
            res.send(status(610))
        } else {
            //found
            var text = req.body.text.toString()
            var imageJSONString = req.body.images
            var images = []
            if (imageJSONString !== undefined) {
                images = JSON.parse(req.body.imageJSONString)
            }
            var timeStamp = Date.timeStamp()
            console.log(images)
            models.counter.find({_id: models.trackInfo.timeline}, function(maxIDErr, maxIDDocs) {
                if (maxIDErr || maxIDDocs.length === 0) {
                    console.log(err)
                    res.send(status(610))
                } else {
                    var newID = maxIDDocs[0].maxID + 1
                    models.counter.update({_id: models.trackInfo.timeline}, {$set: {maxID: newID}}, function(updateMaxIDErr, updateMaxIDDocs) {})
                    var successJSON = {
                        success: "600",
                    }
                    if (images.length !== 0) {
                        var tokenArray = []
                        for (var i = 0;i < images.length; i += 1) {
                            var index = images[i].index
                            var absoluteURL  = imageURL(newID, index)
                            images[i].absoluteURL = absoluteURL
                            tokenArray.push({
                                index: index,
                                token: qn.getUploadInfo(absoluteURL)
                            })
                        }
                        successJSON.tokens = tokenArray
                    }
                    var timeline = new models.user_timeline({
                        _id: newID,
                        account: account,
                        userInfo: docs[0],
                        text: text,
                        images: images,
                        timeStamp: timeStamp,
                        repostCount: 0,
                        isRepost: false,
                        repostTimeline: undefined,
                        comments: undefined,
                        liked: undefined
                    })
                    timeline.save(function(saveErr, saveDocs) {
                        if (saveErr) {
                            console.log(saveErr)
                            res.send(status(610))
                        } else {
                            res.send(successJSON)
                        }
                    })
                }
            })
        }
    })
})

router.post("/app.timeline.like", function(req, res, next) {
    var account = req.body.account.toString()
    var timelineID = req.body.timelineID.toString()
    // var account = "a"
    // var timelineID = "5749456e4d64ad5908e35adb"
    models.user_info.find({_id: account}, function(userInfoError, userInfoDocs) {
        if (userInfoError || userInfoDocs.length === 0) {
            res.send({
                "status": "650",
                "error": userInfoError
            })
        } else {
            var id = mongoose.Types.ObjectId(timelineID)
            models.user_timeline.find({_id: id}, function (timelineError, timelineDocs) {
                if (timelineError || timelineDocs.length === 0) {
                    res.send({
                        "status": "650",
                        "error": timelineError
                    })
                } else {
                    var likeArray = timelineDocs[0].liked
                    like(userInfoDocs[0], likeArray)
                    console.log(likeArray)
                    models.user_timeline.update({_id: id}, {$set: {liked: likeArray}}, function (likeError, likeDocs) {
                        if (likeError) {
                            res.send({
                                "status": "650",
                                "error": likeError
                            });
                        } else {
                            res.send({
                                "status": "640"
                            })
                        }
                    })
                }
            })
        }
    })
})

router.post("/app.timeline.unlike", function(req, res, next) {
    var account = req.body.account.toString()
    var timelineID = req.body.timelineID.toString()
    var id = mongoose.Types.ObjectId(timelineID)
    models.user_timeline.find({_id: id}, function(timelineError, timelineDocs) {
        if (timelineError || timelineDocs.length === 0) {
            res.send({
                "status": "670",
                "error": unlikeError
            })
        } else {
            var likeArray = unlike(account, timelineDocs[0].liked)
            console.log(likeArray)
            models.user_timeline.update({_id: id}, {$set: {liked: likeArray}}, function (unlikeError, unlikeDocs) {
                if (unlikeError) {
                    res.send({
                        "status": "670",
                        "error": unlikeError
                    })
                } else {
                    res.send({
                        "status": "660"
                    })
                }
            })
        }
    })
})

router.get("/app.timeline.get", function(req, res, next) {
    var account = req.query.account
    if (account === undefined || account === "") {
        res.send(status(630))
        return
    }
    models.user_info.find({_id: account}, function(findUserErr, userInfoDocs) {
        if (findUserErr || userInfoDocs.length === 0) {
            res.send(status(630))
            return
        }
        models.user_timeline.find({account: account}, function(err, docs) {
            if (err) {
                res.send(status(630))
                return
            }
            if (docs.length === 0) {
                res.send({
                    status: "620",
                    timelines: []
                })
                return
            }
            res.send({
                status: "620",
                timelines: docs.map(function(element) {
                    element.__v = undefined
                    element.userInfo = userInfoDocs[0]
                    return element
                })
            })
        })
    })
})


/*
 account | the follower's account not null
 firstID | default undefined
 pageSize | default 10
 * */
router.get("/app.timeline.getByFollowing", function(req, res, next) {
    var account = req.query.account
    var maxID = req.query.maxID
    var count = req.query.count
    if (account === undefined || account === "") {
        res.send(status(630))
        return
    }
    models.user_info.find({_id: account}, function(err, docs) {
        if (err || docs.length === 0) {
            res.send(status(630))
            return
        }
        queryFollowing(account, function(follow_infos){
            //onSuccess
            var accounts = getIDArray(follow_infos)
            accounts.push(account)
            findTimelineByAccountArray(accounts, maxID, count, function(timelines) {
                res.send({
                    status: "620",
                    timelines: timelines
                })
            }, function() {
                //failed
                res.send(status(630))
            })
        }, function(){
            //onFailed
            res.send(status(630))
        })
    })
})

router.get("/app.timeline.following", function(req, res, next) {
    var account = req.query.account
    if (account === undefined || account === "") {
        res.send(status(630))
        return
    }
})

function queryFollowing(account, onSuccess, onFailed) {
    models.user_following.find({_id: account}, function (err, docs) {
        if (err) {
            onFailed()
            return
        }
        if (docs.length === 0) {
            onSuccess([])
            return
        }
        models.user_info.find({_id: {$in: getIDArray(docs[0].follow_infos)}}, function (err2, docs2) {
            if (err2) {
                onFailed()
                return
            }
            if (docs2.length === 0) {
                onSuccess([])
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

router.get("/app.text", function(req, res, next) {
    findTimelineByAccount(req.query.account, function(timelines) {
        res.send(timelines)
    })
})

function findTimelineByAccount(account, onSuccess, onFailed) {
    models.user_timeline.find({account: account}).sort({_id: -1}).limit(5).exec(function(err, docs) {
        if (err) {
            onFailed()
            return
        }
        if (docs.length === 0) {
            onSuccess([])
        } else {
            onSuccess(docs)
        }
    })
    models.user_info.find({_id: account}, function(findUserErr, userInfoDocs) {
        if (findUserErr || userInfoDocs.length === 0) {
            onFailed()
            return
        }
        models.user_timeline.find({account: account}, function (err, docs) {
            if (err) {
                onFailed()
                return
            }
            if (docs.length === 0) {
                onSuccess([])
                return
            }
            onSuccess(docs.map(function (element) {
                element.__v = undefined
                element.userInfo = userInfoDocs[0]
                return element
            }))
        })
    })
}

function findTimelineByAccountArray(accounts, maxID, count, onSuccess, onFailed) {
    models.user_info.find({_id: {$in: accounts}}, function(findUserErr, userInfoDocs) {
        if (findUserErr || userInfoDocs.length === 0) {
            onFailed()
            return
        }
        var size = validPageSize(count)
        var query = {
            account: {
                $in: accounts
            }
        }
        if (maxID > 0) {
            query._id = {
                $lte: parseInt(maxID)
            }
        }
        models.user_timeline.find(query).sort({_id: -1}).limit(size).exec(function (err, docs) {
            if (err) {
                onFailed()
                return
            }
            if (docs.length === 0) {
                onSuccess([])
                return
            }
            onSuccess(docs.map(function (element) {
                element.__v = undefined
                element.userInfo = userInfoDocs.filter(function(userInfo) {
                    return userInfo._id === element.account
                })[0]
                return element
            }))
        })
    })
}

function validPageSize(pageSize) {
    if (pageSize === undefined) {
        return 10
    } else if (pageSize <= 0) {
        return 1
    } else if (pageSize > 30) {
        return 30
    }
    return parseInt(pageSize)
}

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

function like(userInfo, likeArray) {
    var inserted = false
    for (var i = 0; i < likeArray.length; i += 1) {
        if (userInfo._id === likeArray[i]._id) {
            likeArray[i] = userInfo;
            inserted = true
            break
        }
    }
    if (!inserted) {
        likeArray.push(userInfo)
    }
    return likeArray
}

function unlike(account, likeArray) {
    for (var i = 0; i < likeArray.length; i += 1) {
        if (account === likeArray[i]._id) {
            likeArray.splice(i, 1)
            break
        }
    }
    return likeArray
}

function imageURL(timelineID, index) {
    return timelineID + "/" + index + ".jpg"
}

router.get("/" + config.allUsers, function(req, res, next) {
    models.user_info.find({}, function(err, docs) {
        res.send(docs)
    })
})

module.exports = router
