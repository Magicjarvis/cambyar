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
