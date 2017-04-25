var fs = require("fs")
var cfg = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))

var config = {
    mongoConfig: cfg.mongoConfig,
    rcAppkey: cfg.rcAppkey,
    rcAppSecret: cfg.rcAppSecret,
    qnAccessKey: cfg.qnAccessKey,
    qnSecretKey: cfg.qnSecretKey,
    qnBucketName: cfg.qnBucketName,
    qnBucketDomain: cfg.qnBucketDomain,
    allUsers: cfg.allUsers,
    interval: cfg.interval
}

module.exports = config