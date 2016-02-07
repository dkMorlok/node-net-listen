var http = require('http');
var net = require('net');

var netListen = require('../index');

describe('listen', function () {
	beforeEach(function () {
		this.callback = jasmine.createSpy('callback');
	});

	it('can start the given HTTP server with path', function (done) {
		var server = new http.createServer();
		var config = {
			path: 'some.sock',
		};
		netListen.listen(server, config, this.callback);
		server.on('listening', function (err) {
			expect(this.callback).toHaveBeenCalledWith(null);
			expect(err).toBe(undefined);
			server.close();
			done();
		}.bind(this));
	});

	it('can start the given HTTP server with port', function (done) {
		var server = new http.createServer();
		var config = {
			port: 1234,
		};
		netListen.listen(server, config, this.callback);
		server.on('listening', function (err) {
			expect(this.callback).toHaveBeenCalledWith(null);
			expect(err).toBe(undefined);
			server.close();
			done();
		}.bind(this));
	});

	it('can start the given socket server', function (done) {
		var server = net.createServer();
		var config = {
			path: 'some.sock',
		};
		netListen.listen(server, config, this.callback);
		server.on('listening', function (err) {
			expect(err).toBe(undefined);
			server.close();
			done();
		});
	});
});
