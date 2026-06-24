const http = require('http');
const path = require('path');
const fs = require('fs');

const logFile = path.join(__dirname, 'debug.log');
function log(msg) {
    try {
        fs.appendFileSync(logFile, new Date().toISOString() + ' - ' + msg + '\n');
    } catch(e) {}
}

// Intercepter console.error pour voir les erreurs internes de Next.js (ex: Prisma)
const originalConsoleError = console.error;
console.error = (...args) => {
    log("NEXT.JS INTERNAL ERROR: " + args.map(a => typeof a === 'object' ? (a.stack || JSON.stringify(a)) : a).join(' '));
    originalConsoleError(...args);
};
const originalConsoleLog = console.log;
console.log = (...args) => {
    log("NEXT.JS LOG: " + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
    originalConsoleLog(...args);
};

log("========= SERVER STARTUP INITIATED =========");

let bootError = null;
let nextHandler = null;

try {
    const next = require('next');
    const requiredServerFilesPath = path.join(__dirname, '.next', 'required-server-files.json');
    if (fs.existsSync(requiredServerFilesPath)) {
        const requiredServerFiles = JSON.parse(fs.readFileSync(requiredServerFilesPath, 'utf8'));
        process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(requiredServerFiles.config);
    }

    const dev = process.env.NODE_ENV !== 'production';
    const dir = path.join(__dirname);

    const app = next({ dev, dir });
    nextHandler = app.getRequestHandler();
    
    app.prepare().catch(err => {
        bootError = err;
    });
} catch (err) {
    bootError = err;
}

const server = http.createServer((req, res) => {
    log(`Incoming HTTP request: ${req.method} ${req.url}`);
    
    const originalEnd = res.end.bind(res);
    res.end = (...args) => {
        log(`Response ended with status: ${res.statusCode} for ${req.url}`);
        originalEnd(...args);
    };
    
    if (bootError) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end("Next.js Boot Error:\n\n" + (bootError.stack || bootError.message || bootError));
        return;
    }

    // Servir les fichiers statiques uploadés (images produits, etc.)
    const parsedUrl = require('url').parse(req.url, true);
    
    // Intercepter les requêtes d'optimisation d'image Next.js (qui plantent sans sharp)
    // et rediriger vers l'image originale non optimisée.
    if (parsedUrl.pathname === '/_next/image' && parsedUrl.query.url) {
        res.writeHead(302, { Location: parsedUrl.query.url });
        res.end();
        return;
    }

    if (parsedUrl.pathname && parsedUrl.pathname.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, 'public', parsedUrl.pathname);
        if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
                '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
                '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
                '.mp4': 'video/mp4',
            };
            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            fs.createReadStream(filePath).pipe(res);
            return;
        }
    }

    if (!nextHandler) {
        res.statusCode = 503;
        res.setHeader('Content-Type', 'text/plain');
        res.end("Next.js est en cours de demarrage...");
        return;
    }

    try {
        nextHandler(req, res, parsedUrl).catch(err => {
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
server.listen(port);

const originalAddress = server.address.bind(server);
server.address = () => {
    const addr = originalAddress();
    if (typeof addr === 'string') {
        return { address: '127.0.0.1', family: 'IPv4', port: 3000 };
    }
    return addr;
};
