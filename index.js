const express = require("express"),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path');

const app = express();

let topMovies = [
    {
        title: 'Talladega Knights: The Ballad of Ricky Bobby',
        director: 'Adam McKay'
    },
    {
        title: 'Remember the Titans',
        director: 'Boaz Yakin'
    },
    {
        title: 'Miracle',
        director: "Gavin O'Connor"
    },
    {
        title: 'The Waterboy',
        director: 'Frank Coraci'
    },
    {
        title: '50 First Dates',
        director: 'Peter Segal'
    },
    {
        title: '(500) Days of Summer',
        director: 'Marc Webb'
    },
    {
        title: 'Definitely Maybe',
        director: 'Adam Brooks'
    },
    {
        title: 'The Dark Knight',
        director: 'Christopher Nolan'
    },
    {
        title: 'The Lord of the Rings: The Return of the King',
        director: 'Peter Jackson'
    },
    {
        title: 'Shrek',
        director: 'Andrew Adamson'
    },
];

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'),
{flags:'a'});

app.use(morgan('combined', {stream: accessLogStream}));

app.get('/', (req, res) => {
    res.send('Welcome to my app!');
});

app.use(express.static('public'));

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something Broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});