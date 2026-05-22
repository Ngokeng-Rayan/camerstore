// server.js — Point d'entrée pour Phusion Passenger (cPanel / o2switch)
// Ce fichier charge le serveur Next.js compilé en mode "standalone".

const { createServer } = require("http");
const { parse } = require("url");
const path = require("path");

// Passenger définit le PORT automatiquement
const port = parseInt(process.env.PORT || "3000", 10);
const hostname = "0.0.0.0";

// Charger Next.js
const next = require("next");
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, hostname, () => {
    console.log(`> CamerStore ready on http://${hostname}:${port}`);
  });
});
