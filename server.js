const http = require('http');
const path = require('path');
const fs = require('fs');

let bootError = null;
let nextHandler = null;

try {
    const next = require('next');

    // Inject the standalone config by reading required-server-files.json
    const requiredServerFilesPath = path.join(__dirname, '.next', 'required-server-files.json');
    if (fs.existsSync(requiredServerFilesPath)) {
        const requiredServerFiles = JSON.parse(fs.readFileSync(requiredServerFilesPath, 'utf8'));
        process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(requiredServerFiles.config);
    }

    const dev = process.env.NODE_ENV !== 'production';
    const dir = path.join(__dirname);

    // Initialise Next.js dans le thread principal (vital pour Passenger)
    const app = next({ dev, dir });
    nextHandler = app.getRequestHandler();
    
    app.prepare().catch(err => {
        bootError = err;
    });
} catch (err) {
    bootError = err;
}

const server = http.createServer((req, res) => {
    if (bootError) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end("Next.js Boot Error:\n\n" + (bootError.stack || bootError.message || bootError));
        return;
    }

    if (!nextHandler) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end("Next.js est en cours de demarrage... Veuillez rafraichir la page dans quelques secondes.");
        return;
    }

    try {
        nextHandler(req, res, require('url').parse(req.url, true)).catch(err => {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end("Next.js Request Error:\n\n" + (err.stack || err.message || err));
        });
    } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end("Next.js Synchronous Request Error:\n\n" + (err.stack || err.message || err));
    }
});

// Port par défaut, intercepté par Passenger
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Ready on port ${port}`);
});
