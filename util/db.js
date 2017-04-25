var mongoose = require("mongoose")
var config = require("./config")
var mongoConfig = config.mongoConfig

var options = {
    user: mongoConfig.user,
    pass: mongoConfig.pass
}

var db = mongoose.connect(mongoConfig.uri, options)
db.connection.on("error", function (err) {
    console.log("db connect failed: " + err)
})
db.connection.on('open', function () {
    console.log('db connect success')
})

module.exports = db