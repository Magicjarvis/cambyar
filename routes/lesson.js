/* 
 * lesson.js
 *   Render lesson pages
 */
var mongoose = require('mongoose');
var async = require('async');
var utils = require('../lib/utils');
var models = mongoose.models;

/*
 * Create-lesson GET page
 */
exports.create = function(req, res, next) {
    
    models.Tag.find({}, function(err, tags) {
        if(err) return next(err);
        async.map(tags, function(tag, cb) {
            cb(null,"'"+ tag.name+ "'"); 
        }, function(err, results) {
            res.render('create-lesson', {
                allTags: results,
            });
        });
    });
    
};


/*
 * POST request for creating a lesson
 *   redirects to lesson on successful DB save
 */
exports.save = function(req, res, next) {
    tags = req.body.tags.split(',');
    async.map(tags, function(tag, cb) {
        var tag_lower = tag.toLowerCase();
        models.Tag.findOne({name: tag_lower}, function(err, results) {
            if(!results) {
                var new_tag = new models.Tag({
                    name: tag_lower,
                });
                new_tag.save(function(err) {
                    if(err) cb(err, null);
                    else cb(null,new_tag._id);
                });
            } else {
                cb(null,results._id);
            }
        });
    }, function(err, results) {
        var lesson = new models.Lesson({
            user: req.user._id, 
            description: req.body.desc,
            title: req.body.title,
            subjects: results, 
        });    
        lesson.save(function(err) {
            if(err) return next(err);
            res.redirect('/lessons/' + lesson._id);
        });
        
    });
}


/*
 * GET request on a lesson page
 */
exports.page = function(req, res, next) {
    models.Lesson.findById(req.params.id, function(err, lesson) {
        if(err) {
            if(err.message !== 'Invalid ObjectId') return next(err);
        }
        /* No lesson by that id exists */
        if(!lesson) {
            return res.send('<strong>Hey this isn\' a page</strong>',404);
        } else {
            models.User.findById(lesson.user, function(err, user) {
                if(err) return next(err);
                if(!user) {
                    return;
                } //some serious shit went down
                models.Rating.find({lesson: lesson._id}, function(err, ratings) {
                    if (err) return next(err);
                    async.reduce(ratings, 0, function(memo, item, cb) {
                        cb(null, memo + item.value);
                    }, function(err, result) {
                        if (err) return next(err); 
                        var rating = "Unrated";
                        if (ratings.length >= 1) rating = result/ratings.length;
                        models.Tag.find({_id : {$in : lesson.subjects}}, function(err, tags){
                            if(err) return next(err); 
                            lesson.author = user;
                            res.render('lesson', {
                                lesson: lesson,
                                lesson_rating: rating,
                                tags: tags,
                            }); 
                        });
                    }); 
                });
            }); 
        }
    });
}


/*
 * GET request for the 'Request a Lesson' page
 */
exports.requestForm = function(req, res, next) {
    models.Lesson.findById(req.query.l, function(err, lesson) {
        if(err) {
            if(err.message !== 'Invalid ObjectId') return next(err);
        }
        if(!lesson) res.send('Nothing here. Move Along', 404);
        models.User.findById(lesson.user, function(err, user) {
            if(err) return next(err);
            if(!user) return; //render something later?

            //Shouldn't happen unless user manually inputs URL
            if(user.username === req.user.username) return res.redirect('back'); 
            models.Request.findOne({
                to: user._id,
                from: req.user._id,
                lesson: lesson._id,
            }, function (err, request) {
                if (err) return next(err);
                if (request) return res.send('Already requested bud', 404);
                res.render('send-request', {
                    'teacher': user,
                    'lesson': lesson,
                });
            });
        });
    });   
}


/*
 * POST request for sending the Lesson Request form
 */
exports.sendRequest = function(req, res, next) {
    models.Lesson.findById(req.query.l, function(err, lesson) {
        if(err) { 
            if(err.message !== 'Invalid ObjectId') return next(err);
        } 
        if(!lesson) res.send('Nothing here', 404);
        
        var request = new models.Request({
            from: req.user._id,
            to: lesson.user,
            message: req.body.message,
            lesson: lesson._id,
        });
       
        request.save(function(err) {
            if(err) return next(err);
            models.User.findOne({_id: lesson.user, alerts: true }, function(err, user) {
                if (err) return next(err);
                if (user) {
                    utils.sendEmail(user.email, './public/email/request.txt', {
                        'subject': 'Pending Requst at Cambyar',
                        'username': user.username,
                        'response_url': '/requests',
                        'edit_url': '/edit-profile' 
                    });
                }
                res.redirect('/lessons/'+lesson._id);
            });
        });
    });

}

/*
 * GET request on the rating page
 */
exports.rate = function(req, res, next) {
    models.Lesson.findById(req.query.l, function(err, lesson) {
        if(err) {
            if(err.message !== 'Invalid ObjectId') return next(err)
        }
        if(!lesson) res.send('Nothing here', 404);
        models.User.findById(lesson.user, function(err, user) {
            if(err) {
                if(err.message !== 'Invalid ObjectId') return next(err)
            }
            if(!user) res.send('Something\'s broken', 500);
            res.render('rate', {
                'lesson': lesson,
                'teacher': user,
            });
        });
    });
}

/*
 * POST request for saving rating
 */
exports.sendRating = function(req, res, next) {
     models.Lesson.findById(req.query.l, function(err, lesson) {
        if(err) {
            if(err.message !== 'Invalid ObjectId') return next(err)
        }
        if(!lesson) res.send('Nothing here', 404);
        models.User.findById(lesson.user, function(err, user) {
            if(err) {
                if(err.message !== 'Invalid ObjectId') return next(err)
            }
            if(!user) return res.send('Something\'s broken', 500);
            models.Request.find({
                to: user._id,
                from: req.user._id,
                lesson: lesson._id,
                status: 'complete',
            }, function(err, requests) {
                if(err) return next(err);
                if(requests.length < 1) return res.send('You can\'t do this', 404)
                models.Rating.update({
                    user: user._id, 
                    rater: req.user._id, 
                    lesson: lesson._id, 
                }, {value: req.body.scale}, {upsert: true}, function(err, rating) {
                    if(err) return next(err);
                    res.redirect('/');
                });
            });

        });
    });
}

/*
 * GET request on edit-lesson page
 */
exports.edit = function(req, res, next) {
    models.Lesson.findById(req.query.l, function(err, lesson) {
        if(err) return next(err);
        if(!lesson) return res.send("No lesson found", 404);
        if(String(lesson.user) !== String(req.user._id)) return res.send("You can't do this");
        models.Tag.find({_id : {$in: lesson.subjects}}, function(err, tags) {
            if(err) return next(err);
            models.Tag.find({}, function(err, all_tags){
                if (err) return next(err);
                async.map(tags, function(tag, cb) {
                    cb(null, tag.name);
                }, function(err, new_tags) {
                    if (err) return next(err);
                    async.map(all_tags, function(item, cb) {
                        cb(null, "'" + item.name + "'");
                    }, function(err, new_all_tags) {
                        res.render('edit-lesson', {
                            all_tags: new_all_tags,
                            lesson: lesson,
                            tags: new_tags,
                        });


                    });

                });
            });
        });
    });
}

/* 
 * POST request for edit-lesson
 */
exports.update = function(req, res, next) {
    var tags = req.body.tags.split(',');
    async.map(tags, function(tag, cb){
        var tag_lower = tag.toLowerCase();
        models.Tag.findOne({name: tag_lower}, function(err, results) {
            if(err) cb(err, null);
            if(!results) {
                var new_tag = new models.Tag({
                    name: tag_lower,
                });
                new_tag.save(function(err) {
                    if(err) cb(err, null);
                    else cb(null,new_tag._id);
                });
            } else {
                cb(null,results._id);
            }
        });
    }, function(err, result) {
        if(err) return next(err);
        models.Lesson.update({_id: req.query.l, user: req.user._id}, {
            title: req.body.title,
            description: req.body.desc,
            subjects: result,
        }, function(err) {
            if(err) return next(err);
            res.redirect('/lessons/'+req.query.l);   
        });
    });
}

exports.delete = function(req, res, next) {
    var id = req.query.l;
    models.Lesson.remove({_id: id, user: req.user.id}, function(err) {
        if (err) return next(err);
        models.Request.remove({lesson: id, to: req.user.id}, function(err) {
            if (err) return next(err);
            res.redirect('back');
        });

    });

}
