const http = require("http");
const fs = require("fs");
const path = require("path");
const axios = require('axios');

const coinDetails = {
    90: { coinName: 'BTC', fullName: 'КУРС BITCOIN ОНЛАЙН' },
    80: { coinName: 'ETH', fullName: 'КУРС ETHEREUM ОНЛАЙН' },
    2710: { coinName: 'BNB', fullName: 'КУРС BINANCE-COIN ОНЛАЙН' },
    48543: { coinName: 'SOL', fullName: 'КУРС SOLANA ОНЛАЙН' },
    33285: { coinName: 'USDC', fullName: 'КУРС USDC-COIN ОНЛАЙН' }
};

function sse(req, res, coinId) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    setInterval(async () => {
        let response = await axios.get(`https://api.coinlore.net/api/ticker/?id=${coinId}`);
        if (response.status === 200) {
            const currentDate = new Date();
            const coinName = coinDetails[coinId].coinName;
            res.write(`data: ${currentDate}\n`);
            res.write(`data: ${coinName}/USDT ${response.data[0].price_usd}\n\n`);
        }
    }, 1000);
}

http.createServer((req, res) => {
    const url = new URL(`http://${req.headers.host}${req.url}`);

    if (url.pathname === "/stream") {
        const coinId = url.searchParams.get('coinId') || 90;  // Default to Bitcoin if no coinId is provided
        sse(req, res, coinId);
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
