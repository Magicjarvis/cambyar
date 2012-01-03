/*
 * user.js
 *   Render user pages
 */
var async = require('async');
var mongoose = require('mongoose');
var models = mongoose.models;

/*
 * GET request for user profile
 */
exports.view = function(req, res, next) {
    models.User.findOne({username: req.params.username}, function(err, user) {
        if(err) return next(err);
        if(!user) return res.send('User Doesn\'t exist', 404);
        models.Lesson.find({user: user._id}, function(err, lessons) {
            if (err) return next(err);
            models.Rating.find({user: user._id}, function(err, ratings) {
                if(err) return next(err);
                async.reduce(ratings, 0, function(memo, item, cb) {
                  cb(null, memo + item.value);  
                }, function(err, result) {
                    if (err) return next(err);
                    var rating = 0;
                    if (ratings.length >= 1) rating = result/(ratings.length);
                    res.render('user', {
                        'this_user': user,
                        'lessons': lessons,
                        'rating': rating,
                    });
                });
            });

        });
        
    });
}


/*
 * GET request for editing a profile
 */
exports.edit = function(req, res, next) {
    models.Tag.find({_id: {$in : req.user.interests}}, function(err, interests) {
        if (err) return next(err);
        models.Tag.find({_id: {$in: req.user.expertise}}, function(err, expertise) {
            if(err) return next(err);
            models.Tag.find({}, function(err, all) {
                if(err) return next(err);
                async.map(interests, function(interest, cb) {
                    cb(null, interest.name);
                }, function(err, new_interests) {
                    if(err) return next(err);
                    async.map(expertise, function(subject, cb) {
                        cb(null, subject.name);
                    }, function(err, new_expertise) {
                        if(err) return next(err);
                        async.map(all, function(tag, cb) {
                            cb(null, "'" + tag.name + "'")
                        }, function(err, all_tags) {
                            if(err) return next(err);
                            res.render('edit-profile', {
                                interests: new_interests,
                                expertise: new_expertise,               
                                tags: all_tags,
                            });
                        });
                    });

                });
            }); 
        });

    });
}


/*
 * POST request for updating a profile
 */
exports.update = function(req, res, next) {
    var interests = req.body.interests.split(',');
    var expertise = req.body.expertise.split(',');
    models.User.findOne({'email': req.body.email}, function(err, user) {
        if (err) return next(err);
        if (user && user.username !== req.user.username) { 
            res.redirect('/user/edit-profile'); 
        } else {
            async.map(interests, function(interest, cb) {
                models.Tag.findOne({name: interest}, function(err, tag) {
                    if (err) cb(err, null);
                    else if (!tag) {
                        var new_tag = new models.Tag({name: interest});
                        new_tag.save(function(err) {
                            cb(null, new_tag._id);
                        });
                    }
                    else cb(null, tag._id);
                });
            }, function(err, interest_ids) {
                if (err) return next(err);
                async.map(expertise, function(subject, cb) {
                    models.Tag.findOne({name: subject}, function(err, tag) {
                        if (err) cb(err, null);
                        else if (!tag){
                            var new_tag = new models.Tag({name: subject});
                            new_tag.save(function(err) {
                                cb(null, new_tag._id);
                            });
                        }
                        else cb(null, tag._id);
                    });
                }, function(err, expert_ids) {
                    if (err) return next(err);
                    models.User.update({username: req.user.username}, {
                        'name': {
                            'first': req.body.name_first,
                            'last':  req.body.name_last,
                        },
                        'email': req.body.email,
                        'interests': interest_ids,
                        'expertise': expert_ids,
                    }, function (err) {
                        if (err) return next(err);
                        res.redirect('/user/'+req.user.username);
                    }); 
                });
            
            });
        }
    });
}
