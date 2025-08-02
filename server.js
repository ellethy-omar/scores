const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'data.json');

function readScores() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function writeScores(scores) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(scores, null, 2));
}

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const file = fs.readFileSync(path.join(__dirname, 'public', 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(file);
  } else if (req.url === '/scores') {
    const scores = readScores();
    scores.sort((a, b) => b.score - a.score);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(scores));
  } else if (req.url.startsWith('/update')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const name = url.searchParams.get('name');
    const delta = parseInt(url.searchParams.get('delta'));

    let scores = readScores();
    scores = scores.map(item =>
      item.name === name ? { ...item, score: item.score + delta } : item
    );
    writeScores(scores);

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else if (req.url.startsWith('/public/')) {
    const filePath = path.join(__dirname, req.url);
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
      } else {
        res.writeHead(200);
        res.end(content);
      }
    });
  } else {
    res.writeHead(404);
    res.end('404 Not Found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
