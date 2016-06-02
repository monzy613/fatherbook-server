var qiniu = require("qiniu")
var config = require("./config")

var fbqiniu = {}
//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = config.qnAccessKey
qiniu.conf.SECRET_KEY = config.qnSecretKey

//要上传的空间
bucket = config.qnBucketName
var client = new qiniu.rs.Client();

/**
 * parameter: filename
 * return token for the filename
* */
fbqiniu.getUploadInfo = function(filename) {
    var putPolicy = new qiniu.rs.PutPolicy(bucket + ":" + filename)
    return putPolicy.token()
}

fbqiniu.remove = function(filename, callback) {
    client.remove(bucket, filename, function(err, ret) {
        if (typeof(callback) === "function") {
            callback(err, ret)
        }
    })
}

fbqiniu.avatarPrefix = "userAvatar"

module.exports = fbqiniu