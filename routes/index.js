var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var crud = require('./crud');
var shelljs = require('shelljs');

function sizeStr(sz) {
    var suffix = ["B", "KB", "MB", "GB", "TB"];
    var i = 0;
    do {
        if (sz < 1000) {
            return (((sz * 100) | 0) / 100.0) + " " + suffix[i];
        } else {
            i++;
            sz = sz / 1000;
        }
    } while (true && sz === sz);
    return sz + " ";
}

/* GET home page. */
router.get(/^\/list\/(.*)/, function (req, res, next) {
    try {
        var pwd = req.params[0];
        if (pwd === path.sep) pwd = "";
        var oldpwd = pwd;
        pwd = pwd + path.sep;
        var folders = fs.readdirSync(pwd);
        var len = folders.length;
        var info = new Object(null);

        var fullf;
        var stat;

        for (var i = 0; i < len; i++) {
            var f = folders[i];
            if (f.indexOf(".") !== 0) { // ignore hidden files
                fullf = pwd + f;
                stat = info[f] = fs.lstatSync(fullf);
                stat.sizeStr = sizeStr(stat.size);
                stat.url = fullf;
                stat.isDir = stat.isDirectory();
            }

        }
        res.json({'message': 'success', data: {pwd: oldpwd, parent: path.dirname(pwd), folders: info}});
//    res.render('index', { pwd: pwd, parent: '/list/'+path.dirname(pwd), folders: info });
    } catch (e) {
        res.json({message: 'error', data: e});
    }
});

router.post('/shell/', function (req, res, next) {
    try {
        var out = shelljs.exec(req.body.command);
        res.json({message: 'success', data: out.output, code: out.code});
    } catch (e) {
        res.json({message: 'error', error: e});
    }
});

crud(router, 'commands', {"name": 'string', "command": 'string'});


module.exports = router;
