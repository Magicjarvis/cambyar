var mongoose = require('mongoose');
var utils = require('./utils');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var User = new Schema({
    
    is_admin: Boolean,
    
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        match: utils.emailCheck,
    },
    name: {
        first: String,
        last: String,
    },
    points: {
        type: Number,
        min: 0,
        default: 0,
    },
    experience: {
        type: Number,
        min: 0,
        default: 0,
    },
    expertise: [ObjectId],
    interests: [ObjectId],

});

User.virtual('name.full')
    .get(function(){
        return utils.nameFull(this.name);
    });


var Rating = new Schema({
    user: ObjectId,
    rater: ObjectId,
    value: {
        type: Number,
        min: 0.0,
        max: 10.0,
    },

});

var Tag = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },

});

var Lesson = new Schema({
    user: ObjectId,
    contacts: ObjectId,
    subjects: [ObjectId],
    description: String,
    title: {
        type: String,
        required: true,
    },

});

var Request = new Schema({
    from: ObjectId,
    to: {
        type: ObjectId,
        required: true,
    },
    lesson: {
        type: ObjectId,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    
});
/* TODO add stuff */
var Contact = new Schema({
    email: String,
});

module.exports = {
    User: mongoose.model('User', User),
    Rating: mongoose.model('Rating', Rating),
    Tag: mongoose.model('Tag', Tag),
    Lesson: mongoose.model('Lesson', Lesson),
    Contact: mongoose.model('Contact', Contact),
    Request: mongoose.model('Request', Request),
}
