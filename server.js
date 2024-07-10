const http = require("http");
const fs = require("fs");
const path = require("path");
const axios = require('axios');

const getRandomInt = max => Math.floor(Math.random() * max);

function sse(req, res) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    setInterval(() => {
        (async function() {
            let response = await axios.get('https://api.coinlore.net/api/ticker/?id=90');
            if (response.status === 200) {
                const currentDate = new Date();
                res.write(`data: ${currentDate}\n`);
                res.write(`data: BTC/USDT ${response.data[0].price_usd}\n\n`);
            }
        })();
    }, 1000);
}

http.createServer((req, res) => {
    const url = new URL(`http://${req.headers.host}${req.url}`);

    if (url.pathname === "/stream") {
        sse(req, res);
        return;
    }

    if (url.pathname === "/styles.css") {
        const cssPath = path.join(__dirname, "styles.css");
        fs.readFile(cssPath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end("CSS file not found");
                return;
            }
            res.setHeader("Content-Type", "text/css");
            res.end(data);
        });
        return;
    }

    const fileStream = fs.createReadStream(path.join(__dirname, "index.html"));
    res.setHeader("Content-Type", "text/html");
    fileStream.pipe(res);
}).listen(8080, () => {
    console.log("Server started on 8080");
});
