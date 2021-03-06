var express = require("express")
var router = express.Router()
var swig = require("swig")
var rongcloudSDK = require('rongcloud-sdk')
var config = require("../util/config")
var mongoose = require("mongoose")
var session = require ('express-session')

//db
var db = require("../util/db")

//rc
rongcloudSDK.init(config.rcAppkey, config.rcAppSecret);

//qn
var fbqn = require("../util/fbqiniu")

// doc modal
var models = require("../models/user")


/* GET users listing. */

router.get("/", function (req, res, next) {
    res.render('login')
})

router.post("/search.account", function (req, res, next) {
    // /app.search.account by account
    var account = req.session.myInfo.account
    console.log(req.session.myInfo)
    var searchString = req.body.searchString
    if (searchString === undefined || searchString === "") {
        res.send({
            status: "410",
            error: "想拿到所有用户? 没门!"
        })
        return
    }
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
                    status: "410"
                })
                return
            }
            res.render("search", {
                users: docs,
                myInfo: req.session.myInfo
            })
        }
    })
})

router.post("/login", function (req, res, next) {
    var account = req.body.account
    var password = req.body.password
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
                var userInfo = {
                    "account": account
                }

                var maxID = req.query.maxID
                var minID = req.query.minID
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
                        findTimelineByAccountArray(accounts, maxID, minID, count, function(timelines) {
                            req.session.myInfo = docs[0]
                            console.log("myInfo: " + req.session.myInfo)
                            res.render("index", {
                                myInfo: docs[0],
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
            }
        }
    })
})

router.get("/register", function (req, res, next) {
    res.render('register')
})

router.post("/register", function (req, res, next) {
    var account = req.body.account
    var password = req.body.password
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
                    res.render('index')
                }
            })

            var userInfo = new models.user_info({
                _id: account,
                phone: req.body.phone,
                email: req.body.email,
                nickname: req.body.nickname === undefined ? req.body.account : req.body.nickname,
                isDefaultAvatar: true,
                official: false,
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

function findTimelineByAccountArray(accounts, maxID, minID, count, onSuccess, onFailed) {
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
        if (maxID >= 0) {
            query._id = {
                $lt: parseInt(maxID)
            }
        }
        if (minID >= 0) {
            query._id = {
                $gt: parseInt(minID)
            }
            models.user_timeline.find(query).sort({_id: -1}).exec(function (err, docs) {
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
            return
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

module.exports = router;