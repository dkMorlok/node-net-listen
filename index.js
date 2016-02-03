var fs = require('fs');
var net = require('net');

module.exports = {

	listen: function(server, config, callback) {
		if (typeof config == 'string') {
			this.listen(server, {path:config}, callback);
			return;
		} else if (typeof config == 'number') {
			if (typeof callback == 'string') {
				this.listen(server, {port:arguments[1], host:arguments[2]}, arguments[3]);
				return;
			} else {
				this.listen(server, {port:arguments[1]}, arguments[2]);
				return;
			}
		}

		if (!callback) {
			throw new Error("Callback is required.");
		}
		if (!config.port && !config.path) {
			throw new Error("Invalid listen object. Path or port is required.");
		}

		server.once('listening', function() {
			if (config.path) {
				// change socket permissions
				fs.chmod(config.path, config.pathMode || 0o777);
			}
			callback(null);
		});

		server.once('error', function (err) {
			if (config.path && err.code == 'EADDRINUSE') {
				// socket taken
				var client = new net.Socket();
				client.on('error', function (err2) {
					if (err2.code == 'ECONNREFUSED') {
						// socket not in use, clear and try again
						fs.unlink(config.path, function() {
							server.listen(config);
						});
					} else {
						 callback(err);
					}
				});
				client.connect({path: config.path}, function () {
					callback(new Error("Server already running", "EALREADYRUNNING"));
				});
			} else {
				callback(err);
			}
		});

		server.listen(config);
	}

};