var http = require('http');

describe('http.Server', function () {
	describe('listen', function () {
		it('takes port via handle argument (undocumented?)', function (done) {
			http.createServer().listen({
				port: 1234,
			}, function (err) {
				expect(err).toBe(undefined);
				this.close();
				done();
			});
		});
	})
});
