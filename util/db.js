var mongoose = require("mongoose")
var config = require("./config")

var db = mongoose.connect(config.mongodbURL)
db.connection.on("error", function (err) {
    console.log("db connect failed: " + err)
})
db.connection.on('open', function () {
    console.log('db connect success')
})

module.exports = db