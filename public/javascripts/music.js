String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};


var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
};

function invert(map) {
    var ret = {};
    for (var i in map) {
        if (map.hasOwnProperty(i)) {
            ret[map[i]] = i;
        }
    }
    return ret;
}

var unescapeMap = invert(escapeMap);

var createEscaper = function (map) {
    var escaper = function (match) {
        return map[match];
    };

    var keys = [];
    for (var i in map) {
        if (map.hasOwnProperty(i)) {
            keys.push(i);
        }
    }
    var source = '(?:' + keys.join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function (string) {
        string = string == null ? '' : '' + string;
        return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
};

var myescape = createEscaper(escapeMap);
var myunescape = createEscaper(unescapeMap);

