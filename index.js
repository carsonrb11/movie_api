const express = require("express"),
    morgan = require('morgan'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    path = require('path'),
    uuid = require('uuid');

const app = express();
app.use(bodyParser.json());

let users = [
    {
        id: 1,
        name: 'Carson',
        favoriteMovies: ["Remember the Titans"]
    },
    {
        id: 2,
        name: "Natasha",
        favoriteMovies: ["Definitely Maybe"]
    }
]

let movies = [
    {
        "Title": 'Talladega Knights: The Ballad of Ricky Bobby',
        "Description": "Here is the description for Talladega Knights",
        "Genre": {
            "Name": "Comedy",
            "Description": "Here is description for this genre"
        },
        "Director": {
            "Name": "Adam McKay",
            "Bio": "Here is Adam McKay's Bio",
            "Birth": "Here is his birthday"
        }
    },
    {
        "Title": 'Remember the Titans',
        "Description": "Here is the description for Remember the Titans",
        "Genre": {
            "Name": "Sports",
            "Description": "Here is description for this genre"
        },
        "Director": {
            "Name": "Boaz Yakin",
            "Bio": "Here is Boaz Yakin's Bio",
            "Birth": "Here is his birthday"
        }
    },
    {
        "Title": 'Miracle',
        "Description": "Here is the description for Miracle",
        "Genre": {
            "Name": "Sports",
            "Description": "Here is description for this genre"
        },
        "Director": {
            "Name": "Gavin O'Connor",
            "Bio": "Here is Gavin O'Connor's Bio",
            "Birth": "Here is his birthday"
        }
    },
    {
        "Title": 'The Waterboy',
        "Description": "Here is the description for The Waterboy",
        "Genre": {
            "Name": "Sports Comedy",
            "Description": "Here is description for this genre"
        },
        "Director": {
            "Name": "Frank Coraci",
            "Bio": "Here is Frank Coraci's Bio",
            "Birth": "Here is his birthday"
        }
    },
    {
        "Title": '50 First Dates',
        "Description": "Here is the description for 50 First Dates",
        "Genre": {
            "Name": "Romantic Comedy",
            "Description": "Here is description for this genre"
        },
        "Director": {
            "Name": "Peter Segal",
            "Bio": "Here is Peter Segal's Bio",
            "Birth": "Here is his birthday"
        }
    },
    {
        "Title": '(500) Days of Summer',
        "Description": "Here is the description for (500) Days of Summer",
        "Genre":  {
            "Name": "Romantic Comedy",
            "Description": "Here is description for this genre"
        },
        "Director": {
            "Name": "Marc Webb",
            "Bio": "Here is Marc Webb's Bio",
            "Birth": "Here is his birthday"
        }
    },
    {
        "Title": 'Definitely Maybe',
        "Description": "Here is the description for Definitely Maybe",
        "Genre":  {
            "Name": "Romantic Comedy",
            "Description": "Here is description for this genre"
        },
        "Director": {
            "Name": "Adam Brooks",
            "Bio": "Here is Adam Brooks's Bio",
            "Birth": "Here is his birthday"
        }
    },
    {
        "Title": 'The Dark Knight',
        "Description": "Here is the description for The Dark Knight",
        "Genre":  {
            "Name": "Superhero",
            "Description": "Here is description for this genre"
        },
        "Director": {
            "Name": "Christopher Nolan",
            "Bio": "Here is Christopher Nolan's Bio",
            "Birth": "Here is his birthday"
        }
    },
    {
        "Title": 'The Lord of the Rings: The Return of the King',
        "Description": "Here is the description for The Lord of the Rings: The Return of the King",
        "Genre":   {
            "Name": "Fantasy",
            "Description": "Here is description for this genre"
        },
        "Director": {
            "Name": "Peter Jackson",
            "Bio": "Here is Peter Jackson's Bio",
            "Birth": "Here is his birthday"
        }
    },
    {
        "Title": 'Shrek',
        "Description": "Here is the description for Shrek",
        "Genre":   {
            "Name": "Comedy",
            "Description": "Here is description for this genre"
        },
        "Director": {
            "Name": "Andrew Adamson",
            "Bio": "Here is Andrew Adamson's Bio",
            "Birth": "Here is his birthday"
        }
    },
];

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'),
{flags:'a'});

app.use(morgan('combined', {stream: accessLogStream}));

app.get('/', (req, res) => {
    res.send('Welcome to my app!');
});

app.use(express.static('public'));


//CREATE Add user
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('users need names')
    }
})


//UPDATE update user name
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id == id);

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else{
        res.status(400).send('no such user')
    }
})

//CREATE add movies to favoriteMovies list
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
    

    let user = users.find( user => user.id == id);

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
    } else{
        res.status(400).send('no such user')
    }
})

//DELETE remove movies from favoriteMovies list
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
    

    let user = users.find( user => user.id == id);

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
    } else{
        res.status(400).send('no such user')
    }
})

//DELETE users from being registered
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    

    let user = users.find( user => user.id == id);

    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).send(`user ${id} has been deleted`);
    } else{
        res.status(400).send('no such user')
    }
})

//READ returns full list of movies
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

//READ returns specific movie by title
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find( movie => movie.Title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('no such movie')
    }

});

//READ returns info on specific Genre by name
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find( movie => movie.Genre.Name === genreName).Genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('no such movie')
    }
    
});

//READ returns info on specific Director by name
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find( movie => movie.Director.Name === directorName).Director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('no such movie')
    }
    
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something Broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});