
var redis = require("redis");
var helpers = require("./helpers");
const redisCountKey = "count_appearances";

var redisClient = redis.createClient();
redisClient.on("error", helpers.logError.bind({ message: "Redis returned an error." }));
redisClient.on("ready", function () { console.log("Redis is ready.") });
redisClient.on("reconnecting", function () { console.log("Redis is reconnecting.") });

function updateCount() {
    redisClient.get(redisCountKey, function (err, reply) {
        if (err) helpers.logError(err);
        if (reply && !isNaN(reply)) {
            var prevCount = Number(reply) + 1;
            redisClient.set(redisCountKey, prevCount);
        }
        else {
            redisClient.set(redisCountKey, 1);
        }
    });
}
function getCount(callback) {
    redisClient.get(redisCountKey, callback);
}

module.exports = { "redisClient": redisClient, "updateCount": updateCount, "getCount": getCount };