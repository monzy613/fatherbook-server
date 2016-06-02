var fs = require("fs")
var cfg = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))

var config = {
    mongodbURL: cfg.mongodbURL,
    rcAppkey: cfg.rcAppkey,
    rcAppSecret: cfg.rcAppSecret,
    qnAccessKey: cfg.qnAccessKey,
    qnSecretKey: cfg.qnSecretKey,
    qnBucketName: cfg.qnBucketName,
    qnBucketDomain: cfg.qnBucketDomain,
    allUsers: cfg.allUsers
}

module.exports = config