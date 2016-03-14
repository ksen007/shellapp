function KMSData(content, data) {
    this.content = content;
    this.data = data;
}

KMSData.prototype.persist = function() {
    this.content.setText(JSON.stringify(this.data));
}

KMS.setPlugin(".json", "javascript", function (text, content) {
    window[content.getId()] = new KMSData(content, text===""?{}:JSON.parse(text));
    return "";
});


function getQueryObject() {
    var ret = {};
    var query = window.location.hash;
    var pipeindex = query.indexOf('|');
    if (pipeindex < 0) {
        return ret;
    }
    query = query.substring(pipeindex+1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[1] !== undefined)
            ret[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return ret;
}

KMS.setPlugin(".ejs", "text/html", function (text, content, post) {
    var params = getQueryObject();
    var fun = window[params[content.getId()]];
    if (fun === undefined) {
        fun = window[content.getId()];
    }
    function tmp(data) {
        post((new EJS({text: text})).render(data));
    }

    var	data = fun(params, tmp);
    if (data !== undefined) {
        tmp(data);
    }
});

function shell() {
    return commands;
}

function folder() {
    return {data: null};
}

function output(args, post) {
    var cmd = commands.data.records[args.id];
    $.ajax({
        url: '/shell/',
        type: 'POST',
        cache: false,
        data: {command: cmd.command},
        dataType: 'json',
        success: function (data) {
            if (data.message === 'success') {
                console.log(JSON.stringify(data));
                post({data: (typeof cmd.post === 'string')?eval('('+cmd.post+')').call(this, data.data): data.data});
            } else {
                console.error('Execution of ' + commandStr + ' failed! ' + JSON.stringify(data.error));
            }
        }.bind(this),
        error: function (xhr, status, err) {
            console.error('Execution of ' + commandStr + ' failed!', status, err.toString());
        }
    });
}

function edit(args) {
    var cmd = commands.data.records[args.id];
    return {data: cmd};
}

