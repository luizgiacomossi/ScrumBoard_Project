const http = require('http');
const host = 'localhost';
const port = 8000;

const fs = require('fs').promises; // inlclue modulo para mandar HTML


const requestListener = function (req, res) {
    fs.readFile(__dirname + "/index.html") 
    /*We use the fs.readFile() method to load the file.
     Its argument has __dirname + "/index.html". 
     The special variable __dirname has the absolute path of where the Node.js 
     code is being run.
     We then append /index.html so we can load the HTML file we created earlier. */
     .then(contents => {
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(contents);
 
    })
    .catch(err => { // em caso de falha
        res.writeHead(500);
        res.end(err);
        return;
    });
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});