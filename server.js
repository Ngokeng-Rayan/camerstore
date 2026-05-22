const http = require('http');
const path = require('path');
const fs = require('fs');

const logFile = path.join(__dirname, 'debug.log');
function log(msg) {
    fs.appendFileSync(logFile, new Date().toISOString() + ' - ' + msg + '\n');
}

log("Server startup initiated");

let bootError = null;
let nextHandler = null;

try {
    log("Requiring Next.js");
    const next = require('next');

    log("Checking required-server-files.json");
    const requiredServerFilesPath = path.join(__dirname, '.next', 'required-server-files.json');
    if (fs.existsSync(requiredServerFilesPath)) {
        log("File exists, parsing config");
        const requiredServerFiles = JSON.parse(fs.readFileSync(requiredServerFilesPath, 'utf8'));
        process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(requiredServerFiles.config);
        log("Config injected");
    } else {
        log("WARNING: required-server-files.json not found!");
    }

    const dev = process.env.NODE_ENV !== 'production';
    const dir = path.join(__dirname);

    log("Initializing Next.js app");
    const app = next({ dev, dir });
    nextHandler = app.getRequestHandler();
    
    log("Calling app.prepare()");
    app.prepare().then(() => {
        log("app.prepare() resolved successfully");
    }).catch(err => {
        log("app.prepare() rejected: " + (err.stack || err));
        bootError = err;
    });
} catch (err) {
    log("Catch block triggered: " + (err.stack || err));
    bootError = err;
}

log("Creating HTTP server");
const server = http.createServer((req, res) => {
    log("Received request: " + req.url);
    if (bootError) {
        log("Serving boot error response");
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end("Next.js Boot Error:\n\n" + (bootError.stack || bootError.message || bootError));
        return;
    }

    if (!nextHandler) {
        log("Serving 'still booting' response");
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end("Next.js est en cours de demarrage... Veuillez rafraichir la page dans quelques secondes.");
        return;
    }

    try {
        log("Passing request to nextHandler");
        nextHandler(req, res, require('url').parse(req.url, true)).catch(err => {
            log("nextHandler rejected: " + (err.stack || err));
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end("Next.js Request Error:\n\n" + (err.stack || err.message || err));
        });
    } catch (err) {
        log("nextHandler threw sync error: " + (err.stack || err));
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end("Next.js Synchronous Request Error:\n\n" + (err.stack || err.message || err));
    }
});

const port = process.env.PORT || 3000;
log("Starting to listen on port: " + port);

server.listen(port, () => {
    log("Server successfully listening on port: " + port);
});

server.on('error', (err) => {
    log("SERVER ERROR EVENT: " + (err.stack || err));
});
