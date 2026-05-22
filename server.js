const http = require('http');
const path = require('path');
const fs = require('fs');

let bootError = null;
let nextHandler = null;

try {
    const next = require('next');

    // Injecter la configuration standalone générée par Next.js
    const requiredServerFilesPath = path.join(__dirname, '.next', 'required-server-files.json');
    if (fs.existsSync(requiredServerFilesPath)) {
        const requiredServerFiles = JSON.parse(fs.readFileSync(requiredServerFilesPath, 'utf8'));
        process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(requiredServerFiles.config);
    }

    const dev = process.env.NODE_ENV !== 'production';
    const dir = path.join(__dirname);

    // Initialiser Next.js dans le thread principal
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

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Ready on port ${port}`);
});

// HACK VITAL POUR PASSENGER :
// Next.js plante s'il écoute sur un socket Unix (ce que Passenger fait)
// car server.address() renvoie une chaîne de caractères au lieu d'un objet avec un port.
// On simule donc un objet avec un faux port pour tromper Next.js.
const originalAddress = server.address.bind(server);
server.address = () => {
    const addr = originalAddress();
    if (typeof addr === 'string') {
        return { address: '127.0.0.1', family: 'IPv4', port: 3000 };
    }
    return addr;
};
