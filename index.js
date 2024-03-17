import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.static('public'));

app.get ("/", (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, './public/html') });
});

app.get ("/pokemon", (req, res) => {
    res.sendFile('pokemonDetails.html', { root: path.join(__dirname, './public/html') });
});

const port = 3000;

app.listen(port, function () {
    console.log(`Server is running at:`);
    console.log(`http://localhost:` + port);
});
