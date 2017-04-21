var http = require('http');
var specialPort = 8888;
function onRequest(request, response){
    console.log("A user made a request" + request.url);
    response.writeHead(200, {"Context-Type":"text/plain"});
    response.write("Here is some data");
    response.end();
}

http.createServer(onRequest).listen(specialPort || 5000);
console.log("Server is now running!");

