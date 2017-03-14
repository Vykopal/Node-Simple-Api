var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index');
var helpers = require('../helpers');
var redis = require('../redisClient');
var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;

chai.use(chaiHttp);

describe('general integration tests', function () {
    it('/track should be accessible via post', function (done) {
        chai.request('http://localhost:8080')
            .post('/track')
            .end(function (err, res) {
                res.should.have.status(200);
                done();
            });
    });
    it('/track should not be accessible via get', function (done) {
        chai.request('http://localhost:8080')
            .get('/track')
            .end(function (err, res) {
                res.should.have.status(405);
                done();
            });
    });
    // todo test also other http verbs
    it('/track should return input json', function (done) {
        var testObj = { "test": "obj" };
        chai.request('http://localhost:8080')
            .post('/track')
            .send(testObj)
            .end(function (err, res) {
                res.should.have.status(200);
                assert.deepEqual(res.body, testObj, "Returned different object");
                done();
            });
    });
    it('/track should return input json with count', function (done) {
        var testObj = { "test": "obj", "count": 1 };
        chai.request('http://localhost:8080')
            .post('/track')
            .send(testObj)
            .end(function (err, res) {
                res.should.have.status(200);
                assert.deepEqual(res.body, testObj, "Returned different object");
                done();
            });
    });
    it('/track should return empty response on invalid data input', function (done) {
        var testObj = '{"test":"';
        chai.request('http://localhost:8080')
            .post('/track')
            .send(testObj)
            .end(function (err, res) {
                res.should.have.status(200);
                assert.equal(JSON.stringify(res.body), "{}");
                done();
            });
    });
    it('/count should be accessible via get', function (done) {
        chai.request('http://localhost:8080')
            .get('/count')
            .end(function (err, res) {
                res.should.have.status(200);
                done();
            });
    });
    it('/count should not be accessible via post', function (done) {
        chai.request('http://localhost:8080')
            .post('/count')
            .end(function (err, res) {
                res.should.have.status(405);
                done();
            });
    });
    // todo test also other http verbs
    it('/count should json with the result', function (done) {
        chai.request('http://localhost:8080')
            .get('/count')
            .end(function (err, res) {
                expect(res.body).to.include.keys("count");
                done();
            });
    });
});

describe('Redis client tests', function () {
    it('getCount should return value', function (done) {
        //mock
        redis.redisClient.get = function (key, callback) { callback(null, "1"); }

        redis.getCount(function (err, reply) {
            expect(err).to.be.null;
            assert.equal(reply, "1");
            done();
        });
    });
    it('updateCount should set value from number', function (done) {
        //mock
        var mValue = null;
        redis.redisClient.set = function (key, value) { mValue = value; }
        redis.redisClient.get = function (key, callback) { callback(null, mValue); }

        //increase from null
        redis.updateCount(1);
        assert.equal(mValue, 1);
        //increase by 1
        redis.updateCount(2);
        assert.equal(mValue, 3);
        //increase by 2
        redis.updateCount(1);
        redis.updateCount(1);
        assert.equal(mValue, 5);
        //increase from higher value
        mValue = 10;
        redis.updateCount(5);
        assert.equal(mValue, 15);
        done();
    });
    it('updateCount should set value from string', function (done) {       
        //mock
        var mValue = null;
        redis.redisClient.set = function (key, value) { mValue = value; }
        redis.redisClient.get = function (key, callback) { callback(null, mValue); }

        //increase from null
        redis.updateCount("2");
        assert.equal(mValue, 2);
        //increase by 1
        redis.updateCount("2");
        assert.equal(mValue, 4);
        //increase by 2
        redis.updateCount("1");
        redis.updateCount("1");
        assert.equal(mValue, 6);
        //increase from higher value
        mValue = 10;
        redis.updateCount("1000");
        assert.equal(mValue, 1010);
        done();
    });
    it('updateCount should fail with incorrect value', function (done) {
        //mock
        var mValue = null;
        redis.redisClient.set = function (key, value) { mValue = value; }
        redis.redisClient.get = function (key, callback) { callback(null, mValue); }

        //increase from null, incorrect
        redis.updateCount("incorrect");
        assert.equal(mValue, null);
        //increase by 1
        redis.updateCount(1);
        assert.equal(mValue, 1);
        //increase by incorrect
        redis.updateCount("");
        assert.equal(mValue, 1);
        done();
    });
});

describe('Helpers tests', function () {
    it("appendToFile should fill all necessary parameters", function (done) {
        var str = "my Test Data";
        helpers.fileSystem.appendFile = function (filename, data, callback) {
            assert.equal(filename, "jsonData.json");
            assert.equal(data, JSON.stringify(str));
            done();
        }
        helpers.appendToFile(str);
    });
    it("logError should call console.error", function (done) {
        var str = "some error message";
        console.error = function (err) {
            assert.equal(err, str);
            done();
        }
        helpers.logError(str);
    });

    it("logError should log bounded message", function (done) {
        var str = "some error message";
        var str2 = " err message 2";
        var errs = "";
        console.error = function (err) {
            errs += err;
        }
        helpers.logError.bind({ "message": str })(str2);
        while (true) {
            if (errs === str + str2) {
                done();
                break;
            }
        }
    });
});
