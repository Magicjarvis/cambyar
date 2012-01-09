/*
 * search.js
 *   search routes
 */
var mongoose = require('mongoose');
var async = require('async');
var geo = require('geocoder');                
var models = mongoose.models;
var utils = require('../lib/utils');


/*
 * GET request on search query and type
 *   Only searches through descripton at the moment
 */
exports.search = function(req, res, next) {
    if (!req.query) {
        res.render('search', {
            lessons: [],
        });
    } 
    switch(req.query.a){
        case 'tag':
            tag(req, res, next);
            break;
        case 'loc':
            loc(req, res, next);
            break;
        default:
            keyword(req, res, next);
    }

}

function keyword(req, res, next) {
    var term = decodeURIComponent(req.query.q);
    var regex = new RegExp(term,'i');
    var results = [];
    models.Lesson.find({description: regex}, function(err, primary) {
        if(err) return next(err);
        results = results.concat(primary);
        async.map(results, function(lesson, cb) {
            cb(null,lesson._id);
        }, function(err, ids) {
            if(err) next(err);
            var terms = term.split(' ');
            regex.compile('('+terms.join('|')+')','i');
            models.Lesson.find({description: regex, _id: {$nin: ids}}, function(err,secondary) {
                if(err) return next(err);
                results = results.concat(secondary);
                async.map(results, function(lesson, cb) {
                    models.User.findById(lesson.user, function(err, user) {
                        if(err) return cb(err, null);
                        lesson.author = user;
                        models.Tag.find({_id: {$in: lesson.subjects}}, function(err, tags) {
                            if(err) return cb(err, null);
                            lesson.tags = tags;
                            cb(null, lesson);
                        });
                    });
                }, function(err, lessons) {
                    if(err) return next(err);
                    res.render('search', {
                        'lessons': lessons,
                    });
                });
            });
        });
    });
}

function tag(req, res, next) {
    var terms = decodeURIComponent(req.query.q);
    var terms = terms.split(",");
    var page = (req.query.p || 1) - 1;
    models.Tag.find({name: {$in: terms}}, function(err, tags) {
        if (err) return next(err);
        async.map(tags, function(tag, cb) {
            cb(null, tag._id);
        }, function(err, result) {
            if(err) return next(err);
            models.Lesson.find({subjects: {$in: result}})
                         .skip(20*page)
                         .limit(20)
                         .run(function(err, lessons) {
                if(err) return next(err);
                async.map(lessons, function(lesson, cb) {
                    models.User.findById(lesson.user, function(err, user) {
                        if(err) return cb(err, null);
                        lesson.author = user;
                        models.Tag.find({_id: {$in: lesson.subjects}}, function(err, tags) {
                            if(err) return cb(err, null);
                            lesson.tags = tags;
                            // Find all the ratings for this lesson
                            // Store total of ratings and num in lesson
                            models.Rating.find({lesson: lesson._id}, function(err, ratings) {
                                async.reduce(ratings, 0, function(memo, rating, cb) {
                                    cb(null, memo+rating.value);
                                }, function(err, total) {
                                    lesson.total = total;
                                    lesson.num = ratings.length;
                                    cb(null, lesson);
                                });
                            });
                        });
                    });
                }, function(err, results) {
                    if(err) return next(err);
                    // Find ALL the ratings and reduce to average
                    models.Rating.find({}, function(err, allRatings) {
                        if (err) return next(err);
                        async.reduce(allRatings, 0, function(memo, rate, cb) {
                            cb(null, memo+rate.value);
                        }, function(err, totalRating) {
                            var totalAvg = 0;
                            if(allRatings.length > 0) totalAvg = totalRating/allRatings.length;
                            // Sorts by bayesian average (see utils)
                            async.sortBy(results, function(les, cb) {
                                // TODO 
                                // Put in 10 for now, should be avg num of ratings per lesson
                                cb(null, -utils.average(10, totalAvg, les.total, les.num));
                            }, function(err, sorted) {
                               if(err) return next(err); 
                                res.render('search', {
                                    'lessons': sorted,
                                });
                            });
                        });
                    });
                });
            });
        });
    });

}


function loc(req, res, next) {
    var address = req.query.q;
    var page = (req.query.p || 1) - 1;
    geo.geocode(address, function(err, data) {
        if(err) return next(err);
        var loc = data.results[0].geometry.location;
        models.Lesson.find({loc: {$near: [loc.lat,loc.lng]}})
                     .skip(page*20)
                     .limit(20)
                     .run(function(err, lessons) {
            if(err) return next(err);
            async.map(lessons, function(lesson, cb) {
                models.User.findById(lesson.user, function(err, user) {
                    if(err) return cb(err, null);
                    lesson.author = user;
                    models.Tag.find({_id: {$in: lesson.subjects}}, function(err, tags) {
                        if(err) return cb(err, null);
                        lesson.tags = tags;
                        cb(null, lesson);
                    });
                });
            }, function(err, results) {
                if(err) return next(err);
                res.render('search', {
                    'lessons': results,
                });
            });
        });

    });
}
