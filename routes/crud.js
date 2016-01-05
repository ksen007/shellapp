module.exports = function (router, name, schema) {
    var FileDB = require('../models/FileDB');

    var Model = FileDB(name, schema);

    //(new Model({'name': 'play', 'command': 'ls'})).save(function () {
    //});
    //(new Model({'name': 'pause', 'command': 'ls'})).save(function () {
    //});

    router.route('/crud/' + name + '/')
        .get(function (req, res) {  // list
            Model.find(function (err, record) {
                if (err) {
                    return res.json({message: 'error', error: err});
                }

                res.json({message: 'success', data: record});
            });
        })
        .post(function (req, res) { // create
            var model = new Model(req.body);

            model.save(function (err) {
                if (err) {
                    return res.json({message: 'error', error: err});
                }
                res.json({message: 'success'});
            });
        });

    router.route('/crud/' + name + '/:id')
        .put(function (req, res) { // update
            Model.findOne({_id: req.params.id}, function (err, record) {
                if (err) {
                    return res.json({message: 'error', error: err});
                }

                for (var prop in req.body) {
                    if (req.body.hasOwnProperty(prop))
                        record[prop] = req.body[prop];
                }

                try {
                    record.save(function (err) {
                        if (err) {
                            return res.json({message: 'error', error: err});
                        }

                        res.json({message: 'success'});
                    });
                } catch(e) {
                    console.log(e);
                }
            });
        })
        .get(function (req, res) {  //
            Model.findOne({_id: req.params.id}, function (err, record) {
                if (err) {
                    return res.json({message: 'error', error: err});
                }
                res.json({message: 'success', data: record});
            });
        })
        .delete(function (req, res) {
            Model.remove({
                _id: req.params.id
            }, function (err, record) {
                if (err) {
                    return res.json({message: 'error', error: err});
                }
                res.json({message: 'success'});
            });
        });
};
