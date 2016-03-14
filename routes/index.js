var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var path = require('path');
var crud = require('./crud');
var shelljs = require('shelljs');
var isWin = /^win/.test(process.platform);
var bcrypt = require('bcrypt');

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
            pwd = pwd.substring(0,pwd.length-pathSep.length);
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
        if (cmd.indexOf('m-async ') === 0) {
            cmd = cmd.substring(cmd.indexOf(' ')+1);
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


var re = /<!--PASSWORD\(([^\)]*)\)-->/;

function matchPassword(file, password) {
    var content = fs.readFileSync(file, "utf8");
    var matches = content.match(re);
    console.log("Hash "+matches[1] +" and password "+password);
    return matches && matches[1] && bcrypt.compareSync(password, matches[1]);
}

router.post('/file/', function (req, res, next) {
    try {
        var action = req.body.action;
        var oldFile;
        if (action === 'write') {
            var file = path.join(STATIC_PATH,req.body.file);
            oldFile = path.join(STATIC_PATH,req.body.oldFile);
            var passFile;
            if (fs.exists(file)) {
                passFile = file;
            } else {
                passFile = oldFile;
            }
            if (matchPassword(passFile, req.body.password)) {
                var salt = bcrypt.genSaltSync(10);
                var hash = bcrypt.hashSync(req.body.newPassword, salt);
                if (!fs.exists(path.dirname(file))) {
                    fs.mkdirsSync(path.dirname(file));
                }
                fs.writeFileSync(file, req.body.content+"\n<!--PASSWORD("+hash+")-->\n",'utf8');
                res.json({message: "Saved "+file, success: true, data: ""});
            } else {
                res.json({message: 'Failed to match password in '+passFile, success: false, data: ""});
            }
        } else if (action === 'remove') {
            oldFile = path.join(STATIC_PATH,req.body.oldFile);
            if (matchPassword(oldFile, req.body.password)) {
                fs.unlinkSync(oldFile);
                res.json({message: "Deleted "+oldFile, success: true, data: ""});
            } else {
                res.json({message: 'Failed to match password in '+oldFile, success: false, data: ""});
            }
        } else {
            res.json({message: 'Unknown action: '+action, success: false, data: ""});
        }
    } catch (e) {
        res.json({message: 'error', success: false, data: JSON.stringify(e)});
    }
});


crud(router, 'commands', {"name": 'string', "command": 'string', rank: 'string', post: 'string'});


module.exports = router;
