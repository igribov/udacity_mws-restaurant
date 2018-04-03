var static = require('node-static');
var path = require('path');
var file = new static.Server(path.resolve(__dirname, '..', 'build'));

require('http').createServer(function (request, response) {
  request.addListener('end', function () {
    file.serve(request, response);
  }).resume();
}).listen(8888);

console.log('Server listen on http://localhost:8888');