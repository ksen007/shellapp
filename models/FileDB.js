
(function() {

    module.exports = function(name, schema) {
        var list;

        function init() {
            var fs = require('fs'), path = require('path');
            try {
                list = JSON.parse(fs.readFileSync(__dirname + path.sep + '..'+path.sep + 'data'+ path.sep + name +'.json', 'utf8'));
            } catch(e) {
                list = {length: 0, records:{}};
            }
        }

        function DBase(obj) {
            if (!(this instanceof  DBase)) {
                return new DBase(obj);
            }
            for(var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    this[prop] = obj[prop];
                }
            }
        }

        function checkSchema(obj) {
            for(var prop in schema) {
                if (schema.hasOwnProperty(prop)) {
                    if (!obj.hasOwnProperty(prop)) {
                        return "Missing property "+prop+ " in "+JSON.stringify(obj);
                    } else {
                        if (typeof obj[prop] !== schema[prop]) {
                            return "Type of property "+prop+" in "+JSON.stringify(obj)+" is not "+schema[prop];
                        }
                    }
                }
            }
            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (!schema.hasOwnProperty(prop)) {
                        return "Extra property "+prop+ " in "+JSON.stringify(obj);
                    }
                }
            }
            return null;
        }

        function serialize(cb, second) {
            try {
                var fs = require('fs'), path = require('path');
                fs.writeFileSync(__dirname + path.sep + '..'+path.sep + 'data'+ path.sep + name +'.json', JSON.stringify(list), 'utf8');
                if (second)
                    cb(undefined, second);
                else
                    cb();
            } catch(e) {
                cb(e);
            }
        }

        DBase.prototype.save = function (cb) {
            if (this.hasOwnProperty("_id")) {
                list.records[this._id] = this;
                serialize(cb);
                return;
            }
            var err = checkSchema(this);
            if (err) {
                cb(err);
                return;
            }

            this._id = list.length;
            list.records[list.length] = this;
            list.length++;
            serialize(cb);
        };

        DBase.find = function (cb) {
            cb(undefined, list);
        };

        DBase.findOne = function (obj, cb) {
            if (!obj.hasOwnProperty("_id")) {
                cb("_id property missing in "+JSON.stringify(obj));
                return;
            }
            var ret = list.records[obj._id];
            if (ret === undefined) {
                cb("Record with id "+obj._id+" not found");
            } else {
                cb(undefined, new DBase(ret));
            }
        };

        DBase.remove = function(obj, cb) {
            if (!obj.hasOwnProperty("_id")) {
                cb("_id property missing in "+JSON.stringify(obj));
                return;
            }
            var ret = list.records[obj._id];
            if (ret === undefined) {
                cb("Record with id "+obj._id+" not found");
            } else {
                delete (list.records)[obj._id];
                serialize(cb, ret);
            }
        };

        init();
        return DBase;
    }

})();
