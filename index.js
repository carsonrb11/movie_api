const express = require("express"),
    morgan = require('morgan'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    path = require('path'),
    uuid = require('uuid'),
    mongoose = require('mongoose'),
    Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/movieMadnessDB', {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true})

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com','https://movie-madness-6651c785b11e.herokuapp.com/'];

app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn't found on the list of allowed origins then
            let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
            return callback(new Error(message ), false);
        }
        return callback(null, true);
    }
}));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const { check, validationResult } = require('express-validator');

// let users = [
//     {
//         id: 1,
//         name: 'Carson',
//         favoriteMovies: ["Remember the Titans"]
//     },
//     {
//         id: 2,
//         name: "Natasha",
//         favoriteMovies: ["Definitely Maybe"]
//     }
// ]

// let movies = [
//     {
//         "Title": 'Talladega Knights: The Ballad of Ricky Bobby',
//         "Description": "Here is the description for Talladega Knights",
//         "Genre": {
//             "Name": "Comedy",
//             "Description": "Here is description for this genre"
//         },
//         "Director": {
//             "Name": "Adam McKay",
//             "Bio": "Here is Adam McKay's Bio",
//             "Birth": "Here is his birthday"
//         }
//     },
//     {
//         "Title": 'Remember the Titans',
//         "Description": "Here is the description for Remember the Titans",
//         "Genre": {
//             "Name": "Sports",
//             "Description": "Here is description for this genre"
//         },
//         "Director": {
//             "Name": "Boaz Yakin",
//             "Bio": "Here is Boaz Yakin's Bio",
//             "Birth": "Here is his birthday"
//         }
//     },
//     {
//         "Title": 'Miracle',
//         "Description": "Here is the description for Miracle",
//         "Genre": {
//             "Name": "Sports",
//             "Description": "Here is description for this genre"
//         },
//         "Director": {
//             "Name": "Gavin O'Connor",
//             "Bio": "Here is Gavin O'Connor's Bio",
//             "Birth": "Here is his birthday"
//         }
//     },
//     {
//         "Title": 'The Waterboy',
//         "Description": "Here is the description for The Waterboy",
//         "Genre": {
//             "Name": "Sports Comedy",
//             "Description": "Here is description for this genre"
//         },
//         "Director": {
//             "Name": "Frank Coraci",
//             "Bio": "Here is Frank Coraci's Bio",
//             "Birth": "Here is his birthday"
//         }
//     },
//     {
//         "Title": '50 First Dates',
//         "Description": "Here is the description for 50 First Dates",
//         "Genre": {
//             "Name": "Romantic Comedy",
//             "Description": "Here is description for this genre"
//         },
//         "Director": {
//             "Name": "Peter Segal",
//             "Bio": "Here is Peter Segal's Bio",
//             "Birth": "Here is his birthday"
//         }
//     },
//     {
//         "Title": '(500) Days of Summer',
//         "Description": "Here is the description for (500) Days of Summer",
//         "Genre":  {
//             "Name": "Romantic Comedy",
//             "Description": "Here is description for this genre"
//         },
//         "Director": {
//             "Name": "Marc Webb",
//             "Bio": "Here is Marc Webb's Bio",
//             "Birth": "Here is his birthday"
//         }
//     },
//     {
//         "Title": 'Definitely Maybe',
//         "Description": "Here is the description for Definitely Maybe",
//         "Genre":  {
//             "Name": "Romantic Comedy",
//             "Description": "Here is description for this genre"
//         },
//         "Director": {
//             "Name": "Adam Brooks",
//             "Bio": "Here is Adam Brooks's Bio",
//             "Birth": "Here is his birthday"
//         }
//     },
//     {
//         "Title": 'The Dark Knight',
//         "Description": "Here is the description for The Dark Knight",
//         "Genre":  {
//             "Name": "Superhero",
//             "Description": "Here is description for this genre"
//         },
//         "Director": {
//             "Name": "Christopher Nolan",
//             "Bio": "Here is Christopher Nolan's Bio",
//             "Birth": "Here is his birthday"
//         }
//     },
//     {
//         "Title": 'The Lord of the Rings: The Return of the King',
//         "Description": "Here is the description for The Lord of the Rings: The Return of the King",
//         "Genre":   {
//             "Name": "Fantasy",
//             "Description": "Here is description for this genre"
//         },
//         "Director": {
//             "Name": "Peter Jackson",
//             "Bio": "Here is Peter Jackson's Bio",
//             "Birth": "Here is his birthday"
//         }
//     },
//     {
//         "Title": 'Shrek',
//         "Description": "Here is the description for Shrek",
//         "Genre":   {
//             "Name": "Comedy",
//             "Description": "Here is description for this genre"
//         },
//         "Director": {
//             "Name": "Andrew Adamson",
//             "Bio": "Here is Andrew Adamson's Bio",
//             "Birth": "Here is his birthday"
//         }
//     },
// ];

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'),
{flags:'a'});

app.use(morgan('combined', {stream: accessLogStream}));

app.get('/', (req, res) => {
    res.send('Welcome to my app!');
});

app.use(express.static('public'));


//CREATE Add user
app.post('/users',
    //Validation logic for request
    [
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
        check('Password', 'Password must be at least 8 characters long').isLength({min: 8}),
        check('Email', 'Email does not appear to be valid').isEmail()
    ],
    async (req, res) => {

        //check the validation object for errors
        let errors = validationResult(req);

        if (!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array() });
        }

        let hashedPassword = Users.hashPassword(req.body.Password);
        await Users.findOne({ Username: req.body.Username})
            .then((user) => {
                if (user) {
                    return res.status(400).send(req.body.Username + 'already exists');
                } else {
                    Users
                        .create({
                            Username: req.body.Username,
                            Password: hashedPassword,
                            Email: req.body.Email,
                            Birthday: req.body.Birthday
                        })
                        .then((user) => {res.status(201).json(user)})
                        .catch((error) => {
                            console.error(error);
                            res.status(500).send('Error: ' + error);
                        })
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    });

//Get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) =>{
    await Movies.find()
    .then((movies) => {
        res.status(201).json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
})

// Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.find()
    .then((users) => {
        res.status(201).json(users);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
    .then((user) => {
        res.json(user);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Get a movie by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
})

//Return data about a genre by name
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), async (req,res) => {
    await Movies.findOne({ 'Genre.Name': req.params.genreName})
    .then((genre) => {
        if (!genre) {
            res.status(400).send(req.params.genreName + ' was not found.')
        } else {
            res.json(genre)
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
})

//Return data about a director by name
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) =>{
    await Movies.findOne({ 'Director.Name': req.params.directorName})
    .then((director) => {
        res.json(director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
})

//Update a user's info, by username
app.put('/users/:Username',
    //Validation logic here for request
    [
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password must be at least 8 characters.').isLength({min: 8}),
        check('Email', 'Email does not appear to be valid.').isEmail()
    ], passport.authenticate('jwt', { session: false }), async (req, res) => {
        //Check the validation for errors
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        //Condition to check if user matches the profile they are trying to edit below
        if(req.user.Username !== req.params.Username){
            return res.status(400).send('Permission Denied');
        }
        let hashedPassword = Users.hashPassword(req.body.Password);
        await Users.findOneAndUpdate({ Username: req.params.Username}, { $set: 
            {
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            }
        },
        {new: true})
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    //Condition to check if user matches the profile they are trying to edit below
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission Denied');
    }
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { FavoriteMovies: req.params.MovieID }
    },
    { new: true})
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    //Condition to check if user matches the profile they are trying to edit below
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission Denied');
    }
    await Users.findOneAndDelete({ Username: req.params.Username })
    .then((user) => {
        if (!user) {
            res.status(400).send(req.params.Username + ' was not found');
        } else {
            res.status(200).send(req.params.Username + ' was deleted.');
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
})

//Remove a movie from a user's list of favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    //Condition to check if user matches the profile they are trying to edit below
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission Denied');
    }
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
        $pull: { FavoriteMovies: req.params.MovieID }
    },
    {new: true})
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// //READ returns full list of movies
// app.get('/movies', (req, res) => {
//     res.status(200).json(movies);
// });

// //READ returns specific movie by title
// app.get('/movies/:title', (req, res) => {
//     const { title } = req.params;
//     const movie = movies.find( movie => movie.Title === title);

//     if (movie) {
//         res.status(200).json(movie);
//     } else {
//         res.status(400).send('no such movie')
//     }

// });

// //READ returns info on specific Genre by name
// app.get('/movies/genre/:genreName', (req, res) => {
//     const { genreName } = req.params;
//     const genre = movies.find( movie => movie.Genre.Name === genreName).Genre;

//     if (genre) {
//         res.status(200).json(genre);
//     } else {
//         res.status(400).send('no such movie')
//     }
    
// });

// //READ returns info on specific Director by name
// app.get('/movies/directors/:directorName', (req, res) => {
//     const { directorName } = req.params;
//     const director = movies.find( movie => movie.Director.Name === directorName).Director;

//     if (director) {
//         res.status(200).json(director);
//     } else {
//         res.status(400).send('no such movie')
//     }
    
// });

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something Broke!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port' + port);
});