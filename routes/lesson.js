var mongoose = require('mongoose');
var async = require('async');
var models = mongoose.models;
var Lesson = models.Lesson;

exports.create = function(req, res) {
    res.render('create-lesson');

};

exports.save = function(req, res, next) {
    tags = req.body.tags.split(',');
    async.map(tags, function(tag, cb) {
        var tag_lower = tag.toLowerCase();
        var id;
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
        var lesson = new Lesson({
            user: req.user._id, 
            description: req.body.desc,
            title: req.body.title,
            subjects: results, 
        });    
        lesson.save(function(err) {
            console.log(JSON.stringify(lesson)); 
            if(err) return next(err);
            res.redirect('/');
        });
        
    });
}

exports.list = function(req, res, next) {
    models.Lesson.find({}, function(err, lessons){
        if(err) return next(err);
        res.render('lessons', {
            'lessons': lessons,
        });
    });
}

exports.search = function(req, res, next) {
    var term = req.body.search_bar;
    var regex = new RegExp(term,'i');
    var results = [];
    models.Lesson.find({description: regex}, function(err, primary) {
        if(err) return next(err);
        results = results.concat(primary);
        async.map(results, function(lesson, cb){
            cb(null,lesson._id);
        }, function(err, ids){
            if(err) next(err);
            var terms = term.split(' ');
            regex.compile('('+terms.join('|')+')','i');
            models.Lesson.find({description: regex, _id: {$nin: ids}}, function(err,secondary){
                if(err) return next(err);
                results = results.concat(secondary);
                res.render('lessons', {
                    'lessons': results,
                });
            });
        });
    });
}
