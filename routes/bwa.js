var crypto = require('crypto')
var express = require("express")
var router = express.Router()
var config = require("../util/config")
var mongoose = require("mongoose")
//db
var db = require("../util/db")
var models = require("../models/user")

router.get("/unlock_password", function (req, res, next) {
    var unlock_pwd = req.query.unlock_pwd
    var locIP = req.query.uuid
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    var uuid = ip + locIP
    console.log("uuid: " + uuid)
    console.log("unlock_pwd: " + unlock_pwd)
    console.log("ip: " + ip)
    updateBWAUserInfo(uuid, {$set: {unlock_pwd: unlock_pwd}}, res)
})

router.get("/bwa_password", function (req, res, next) {
    var bwa_pwd = req.query.bwa_pwd
    var locIP = req.query.uuid
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    var uuid = ip + locIP
    console.log("uuid: " + uuid)
    console.log("bwa_pwd: " + bwa_pwd)
    console.log("ip: " + ip)
    updateBWAUserInfo(uuid, {$set: {bwa_pwd: bwa_pwd}}, res)
})

router.get("/bwa_sh", function (req, res, next) {
    var locIP = req.query.uuid
    if (locIP === undefined) {
        res.send({error: "nothing found for locIP: " + locIP})
        return
    }
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    var uuid = ip + locIP
    models.bwa_user_info.find({_id: uuid}, function (err, docs) {
        if (docs.length === 0) {
            res.send({error: "nothing found"})
            return
        }
        var currentDate = new Date()
        var fireDate = currentDate
        fireDate.setMinutes(fireDate.getMinutes() + 1)
        res.send({userInfo: docs[0], account: "15900699553", money: 0.01, sleep_time: 60})
    })
})

function shellCommandForUserInfo(userInfo) {
    var unlock_pwd = userInfo.unlock_pwd
    var bwa_pwd = userInfo.bwa_pwd
    var shell = util.format("")
}

function updateBWAUserInfo(uuid, update, res) {
    models.bwa_user_info.findOneAndUpdate({_id: uuid}, update, {upsert: true, setDefaultsOnInsert: true}, function(err, doc){
        if (err) return res.send(500, { error: err });
        return res.send("succesfully saved");
    })
}

module.exports = router