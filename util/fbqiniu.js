var qiniu = require("qiniu")
import config from "../util/config"

var fbqiniu = {}
//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = config.qnAccessKey
qiniu.conf.SECRET_KEY = config.qnSecretKey

//要上传的空间
bucket = config.qnBucketName


/**
 * parameter: filename
 * return token for the filename
* */
fbqiniu.getUploadInfo = function(filename) {
    var putPolicy = new qiniu.rs.PutPolicy(bucket + ":" + filename)
    return putPolicy.token()
}

module.exports = fbqiniu