const http = require('http');
const path = require('path');
const fs = require('fs');

const logFile = path.join(__dirname, 'debug.log');
function log(msg) {
    fs.appendFileSync(logFile, new Date().toISOString() + ' - ' + msg + '\n');
}

log("========= SERVER STARTUP INITIATED =========");

let bootError = null;
let nextHandler = null;

try {
    log("Requiring Next.js module");
    const next = require('next');

    log("Reading standalone config from required-server-files.json");
    const requiredServerFilesPath = path.join(__dirname, '.next', 'required-server-files.json');
    if (fs.existsSync(requiredServerFilesPath)) {
        log("File found, parsing JSON");
        const requiredServerFiles = JSON.parse(fs.readFileSync(requiredServerFilesPath, 'utf8'));
        process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(requiredServerFiles.config);
        log("Standalone config successfully injected");
    } else {
        log("WARNING: .next/required-server-files.json is missing!");
    }

    const dev = process.env.NODE_ENV !== 'production';
    const dir = path.join(__dirname);

    log(`Initializing Next.js app (dev: ${dev}, dir: ${dir})`);
    const app = next({ dev, dir });
    nextHandler = app.getRequestHandler();
    
    log("Calling app.prepare()");
    app.prepare().then(() => {
        log("app.prepare() resolved successfully!");
    }).catch(err => {
        log("app.prepare() rejected with error: " + (err.stack || err.message || err));
        bootError = err;
    });
} catch (err) {
    log("Synchronous exception during initialization: " + (err.stack || err.message || err));
    bootError = err;
}

log("Creating HTTP server instance");
const server = http.createServer((req, res) => {
    log(`Incoming HTTP request: ${req.method} ${req.url}`);
    
    if (bootError) {
        log("Serving boot error response");
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end("Next.js Boot Error:\n\n" + (bootError.stack || bootError.message || bootError));
        return;
    }

    if (!nextHandler) {
        log("Serving 'still booting' response");
        res.statusCode = 503;
        res.setHeader('Content-Type', 'text/plain');
        res.end("Next.js est en cours de demarrage... Veuillez rafraichir la page dans 5 secondes.");
        return;
    }

    try {
        log("Passing request to nextHandler");
        nextHandler(req, res, require('url').parse(req.url, true)).then(() => {
            log("Request handled successfully by nextHandler");
        }).catch(err => {
            log("nextHandler rejected with error: " + (err.stack || err.message || err));
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end("Next.js Request Error:\n\n" + (err.stack || err.message || err));
        });
    } catch (err) {
        log("nextHandler threw synchronous error: " + (err.stack || err.message || err));
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end("Next.js Synchronous Request Error:\n\n" + (err.stack || err.message || err));
    }
});

const port = process.env.PORT || 3000;
log(`Calling server.listen on port/socket: ${port}`);

server.listen(port, () => {
    log(`Server is now successfully listening on ${port}`);
});

server.on('error', (err) => {
    log("SERVER EVENT 'error' emitted: " + (err.stack || err.message || err));
});

// Hack pour Passenger
const originalAddress = server.address.bind(server);
server.address = () => {
    const addr = originalAddress();
    log(`server.address() called. Original returned: ${JSON.stringify(addr) || addr}`);
    if (typeof addr === 'string') {
        return { address: '127.0.0.1', family: 'IPv4', port: 3000 };
    }
    return addr;
};
log("server.address() has been mocked for Passenger compatibility");
