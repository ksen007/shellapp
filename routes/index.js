var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var crud = require('./crud');
var shelljs = require('shelljs');
var isWin = /^win/.test(process.platform);

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

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
        var pathSep = '/';
        if (isWin) pathSep = pathSep + '/';
        var pwd = req.params[0];
        if (pwd.endsWith(pathSep)) {
            pwd = pwd.substring(0,pwd.length-2);
        }
        var oldpwd = pwd;
        pwd = pwd + pathSep;
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
    } catch (e) {
        res.json({message: 'error', data: e});
    }
});

router.post('/shell/', function (req, res, next) {
    try {
        var cmd = req.body.command;
        if (cmd.indexOf('async ') === 0) {
            cmd = cmd.substring(cmd.indexOf(' '));
            shelljs.exec(cmd, {async: true});
            res.json({message: 'success', data: "", code: 0});
        } else {
            var out = shelljs.exec(cmd);
            res.json({message: 'success', data: out.output, code: out.code});
        }
    } catch (e) {
        res.json({message: 'error', error: e});
    }
});

crud(router, 'commands', {"name": 'string', "command": 'string'});


module.exports = router;
