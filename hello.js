const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("PASSENGER EST EN VIE ! Le probleme vient de la memoire Next.js.");
});
server.listen(process.env.PORT || 3000, () => {
    console.log('Hello app is listening');
});
