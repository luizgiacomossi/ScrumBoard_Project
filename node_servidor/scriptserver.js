const http = require('http')
const host = "localhost"
const port = 3000

const requestListener = function (req, res) {
    res.writeHead(200);
    res.end("Meu servin\n");
};

const server = http.createServer(requestListener);


server.listen(port, () => {
  console.log(`Server running at port ${port}`)
})