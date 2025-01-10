const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean,
});

let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, reuiqred: true},
    Birthday: Date,
    FavoriteMovies:[{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

userSchema.statistics.hashPassword = (password) => {
    return bycrpt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
    return bycrpt.compareSync(password, this.Password);
};


let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;