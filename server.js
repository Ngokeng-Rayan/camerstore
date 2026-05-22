const http = require('http');
const path = require('path');

let bootError = null;
let nextHandler = null;

try {
    const next = require('next');

    // Inject the standalone config if it exists
    const standaloneServerPath = path.join(__dirname, 'server.js.bak');
    const fs = require('fs');
    if (fs.existsSync(standaloneServerPath)) {
        const content = fs.readFileSync(standaloneServerPath, 'utf8');
        const match = content.match(/process\.env\.__NEXT_PRIVATE_STANDALONE_CONFIG = ('.*?'|".*?"|JSON\.stringify\(.*?\))/);
        if (match) {
            eval('process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = ' + match[1]);
        }
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
    if (bootError) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end("Next.js Boot Error:\n\n" + (bootError.stack || bootError.message || bootError));
        return;
    }

    if (!nextHandler) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end("Next.js handler not initialized yet. Refresh in a few seconds.");
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
