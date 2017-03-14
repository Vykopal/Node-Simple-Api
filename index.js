var restify = require('restify');

var helpers = require("./helpers");
var redisClient = require("./redisClient");

function trackRespond(req, res, next) {
    var body = req.body && typeof req.body === "object" && req.body;
    if (body) {
        helpers.appendToFile(body);
        body.count && redisClient.updateCount(body.count);
        res.send(body);
    }
    else res.send();
    next();
}

function countRespond(req, res, next) {
    redisClient.getCount(function (err, reply) {
        if (err) helpers.logError(err);
        res.send({ "count": reply });
        next();
    });
}

var server = restify.createServer({
    name: "SimpleApi"
});
server.use(restify.bodyParser());

server.post('/track', trackRespond);
server.get('/count', countRespond);

server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});