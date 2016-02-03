# net-listen

Node listen helper for net module helping with socket listening.

- throw error when socket is used (server running)
- when socket file is not used (server not running), is automatically removed and server started.
- change socket mode to *0777* (chmod 0o777)


# Installation

	npm install net-listen --save
	 
	 
# Usage

## Getting started 

	var http = require('http');
	var netListen = require('net-listen');
	
	var server = http.createServer();
	var path = 'path/to/socket.sock';
	
	netListen.listen(server, path, function(err) {
		if (err) {
    		console.error(err);
    		process.exit();
    	}
    });


## Alternative usage

	netListen.listen(server, path, function(err) { ... });
	netListen.listen(server, port, function(err) { ... });
	netListen.listen(server, port, host, function(err) { ... });
	netListen.listen(server, config, function(err) { ... });
	
- path - *String* Unix socket file. Directory must be writable.
- port - *Number* Listening TCP port
- host - *String* Listening TCP host
- config - *Object* Config is same as [Net module listen options][1] and can have some additional options: 
	- pathMode - default *0o777*

[1]: https://nodejs.org/api/net.html#net_server_listen_options_callback
