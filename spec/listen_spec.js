var events = require("events");
var util = require("util");
var fs = require('fs');
var net = require('net');

var netListen = require('../index');

function MockServer() {
	spyOn(this, 'emit').and.callThrough();
	this.listen = jasmine.createSpy('listen');
}
util.inherits(MockServer, events.EventEmitter);

describe('listen', function () {
	beforeEach(function () {
		this.server = new MockServer();
		this.callback = jasmine.createSpy('callback');
	});

	it('restarts itself if config is a string', function () {
		spyOn(netListen, 'listen').and.callThrough();
		var config = 'some.sock';
		netListen.listen(this.server, config, this.callback);
		expect(netListen.listen).toHaveBeenCalledWith(this.server, {path: config}, this.callback);
	});

	it('restarts itself if config is a number and callback is a function', function () {
		spyOn(netListen, 'listen').and.callThrough();
		var config = 1234;
		netListen.listen(this.server, config, this.callback);
		expect(netListen.listen).toHaveBeenCalledWith(this.server, {port: config}, this.callback);
	});

	it('restarts itself if config is a number and callback is a string', function () {
		spyOn(netListen, 'listen').and.callThrough();
		var config = 1234;
		var callback = 'somehost';
		netListen.listen(this.server, config, callback, this.callback);
		expect(netListen.listen).toHaveBeenCalledWith(this.server, {port: config, host: callback}, this.callback);
	});

	it('requires callback to be specified', function () {
		expect(function () {
			netListen.listen(this.server, {});
		}).toThrowError(/callback is required/i);
	});

	it('requires config.port or config.path to be specified', function () {
		expect(function () {
			netListen.listen(this.server, {}, this.callback);
		}.bind(this)).toThrowError(/path or port is required/i);
	});

	it('starts the given server with the given config', function () {
		var config = {
			path: 'some.sock',
		};
		netListen.listen(this.server, config, this.callback);
		expect(this.server.listen).toHaveBeenCalledWith(config);
	});

	it('sets default unix socket permissions on server start (0o777 intentional?)', function (done) {
		var chmod = spyOn(fs, 'chmod');
		var config = {
			path: 'some.sock',
		};
		netListen.listen(this.server, config, function (err) {
			expect(err).toBe(null);
			expect(chmod).toHaveBeenCalledWith(config.path, 0o777);
			done();
		});
		this.server.emit('listening');
	});

	it('sets given unix socket permissions on server start', function (done) {
		var chmod = spyOn(fs, 'chmod');
		var config = {
			path: 'some.sock',
			pathMode: 0777,
		};
		netListen.listen(this.server, config, function (err) {
			expect(err).toBe(null);
			expect(chmod).toHaveBeenCalledWith(config.path, 0777);
			done();
		});
		this.server.emit('listening');
	});

	it('propagates server errors', function (done) {
		var config = {
			path: 'some.sock',
		};
		netListen.listen(this.server, config, function (err) {
			expect(err).toMatch(/whatnot/);
			done();
		});
		this.server.emit('error', new Error('whatnot'))
	});

	it('tries to clear the socket and start again if socket exists and is not alive', function (done) {
		var test = this;
		spyOn(fs, 'unlink').and.callThrough();
		spyOn(net.Socket.prototype, 'connect').and.callFake(function () {
			this.emit('error', {
				code: 'ECONNREFUSED',
			});
			setTimeout(function () {
				expect(fs.unlink).toHaveBeenCalledWith(config.path, jasmine.any(Function));
				expect(test.server.listen.calls.count()).toBe(2);
				done();
			}, 100);
		});
		var config = {
			path: 'some.sock',
		};
		netListen.listen(this.server, config, function (err) {
			done.fail();
		});
		this.server.emit('error', {
			code: 'EADDRINUSE',
		});
	});

	it('fails if the socket already exists and is alive', function (done) {
		spyOn(net.Socket.prototype, 'connect').and.callFake(function (options, connectListener) {
			connectListener();
		});
		var config = {
			path: 'some.sock',
		};
		netListen.listen(this.server, config, function (err) {
			expect(err).toMatch(/server already running/i);
			done();
		});
		this.server.emit('error', {
			code: 'EADDRINUSE',
		});
	});

	it('doesn\'t propagate socket errors (intentional?)', function (done) {
		spyOn(net.Socket.prototype, 'connect').and.callFake(function () {
			this.emit('error', new Error('whatnot'));
		});
		var config = {
			path: 'some.sock',
		};
		netListen.listen(this.server, config, function (err) {
			expect(err.code).toBe('EADDRINUSE');
			done();
		});
		this.server.emit('error', {
			code: 'EADDRINUSE',
		});
	});
});
