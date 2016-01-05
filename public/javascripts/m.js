(function () {
    function C() {
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

        this.escape = createEscaper(escapeMap);
        this.unescape = createEscaper(unescapeMap);

        this.showView = function (name) {
            $('.m-view').each(function () {
                if ($(this).attr('id') === 'm-' + name) {
                    $(this).css('display', 'inline');
                } else {
                    $(this).css('display', 'none');
                }
            });
        };

        this.updateView = function (name, data) {
            //console.log(new EJS({url: '/' + name + '.ejs'}).render({data: data}));
            new EJS({url: '/ejs/' + name + '.ejs'}).update('m-' + name, {data: data});
            this.showView(name);
        };

        this.createRecord = function (modelName, viewName, record) {
            $.ajax({
                url: '/crud/' + modelName + '/',
                type: 'POST',
                cache: false,
                data: record,
                dataType: 'json',
                success: function (data) {
                    if (data.message === 'success') {
                        this.listRecords(modelName, viewName);
                    } else {
                        console.error('Creation of ' + JSON.stringify(record) + ' failed! ' + JSON.stringify(data.error));
                    }
                }.bind(this),
                error: function (xhr, status, err) {
                    console.error('Creation of ' + JSON.stringify(record) + ' failed!', status, err.toString());
                }
            });
        };

        this.listRecords = function (modelName, viewName) {
            $.ajax({
                url: '/crud/' + modelName + '/',
                type: 'GET',
                cache: false,
                success: function (data) {
                    if (data.message === 'success') {
                        this.updateView(viewName, data.data);
                    } else {
                        console.error('Listing of ' + modelName + ' failed!');
                    }
                }.bind(this),
                error: function (xhr, status, err) {
                    console.error('Listing of ' + modelName + ' failed!', status, err.toString());
                }
            });
        };

        this.saveRecord = function (modelName, viewName, id, record) {
            $.ajax({
                url: '/crud/' + modelName + '/' + id + '/',
                type: 'PUT',
                cache: false,
                data: record,
                dataType: 'json',
                success: function (data) {
                    if (data.message === 'success') {
                        this.listRecords(modelName, viewName);
                    } else {
                        console.error('Update of ' + JSON.stringify(record) + ' failed! ' + JSON.stringify(data.error));
                    }
                }.bind(this),
                error: function (xhr, status, err) {
                    console.error('Update of ' + JSON.stringify(record) + ' failed!', status, err.toString());
                }
            });
        };

        this.createOrSaveRecord = function (modelName, viewName, record) {
            if (record._id === '') {
                delete record._id;
                this.createRecord(modelName, viewName, record);
            } else {
                this.saveRecord(modelName, viewName, record._id, record);
            }
        };

        this.deleteRecord = function (modelName, viewName, id) {
            $.ajax({
                url: '/crud/' + modelName + '/' + id + '/',
                type: 'DELETE',
                cache: false,
                success: function (data) {
                    if (data.message === 'success') {
                        this.listRecords(modelName, viewName);
                    } else {
                        console.error('Deletion of ' + id + ' failed! ' + data.error);
                    }
                }.bind(this),
                error: function (xhr, status, err) {
                    console.error('Deletion of ' + id + ' failed! ' + JSON.stringify(data.error));
                }
            });
        };

        this.expandCommand = function (commandStr, transform) {
            var allFiles = '';
            var checkedFiles, tmp2 = m$.data.checked;
            if (m$.data.pwd === undefined) {
                m$.data.pwd = '/';
            }

            if (transform) {
                checkedFiles = [];
            }
            for (var i = 0; i < tmp2.length; i++) {
                if (transform) {
                    checkedFiles.push(tmp2[i].replace(/\/\//g, '\\'));
                }
            }
            if (!transform) {
                checkedFiles = tmp2;
            }

            if (/\$pwd/.test(commandStr)) {
                commandStr = commandStr.replace(/\$pwd/g, m$.data.pwd);
            }
            if (/\$all/.test(commandStr)) {
                if (checkedFiles && checkedFiles.length > 0) {
                    allFiles = checkedFiles.join(' ');
                }
                commandStr = commandStr.replace(/\$all/g, allFiles);
            }
            var tmp = "";
            if (/\$each/.test(commandStr)) {
                for (i = 0; i < checkedFiles.length; i++) {
                    tmp = tmp + commandStr.replace(/\$each/g, checkedFiles[i]) + ';';
                }
                commandStr = tmp;
            }
            return commandStr;
        };

        this.executeCommand = function (viewName, commandStr) {
            if (commandStr.indexOf('m-open') === 0) {
                commandStr = this.expandCommand(commandStr, false);
                this.listFolder('finder', commandStr.substring(commandStr.indexOf(' ')).trim());
            } else {
                commandStr = this.expandCommand(commandStr, true);
                console.log(commandStr);
                $.ajax({
                    url: '/shell/',
                    type: 'POST',
                    cache: false,
                    data: {command: commandStr},
                    dataType: 'json',
                    success: function (data) {
                        if (data.message === 'success') {
                            console.log(JSON.stringify(data));
                            if (data.data !== '')
                                this.updateView(viewName, data.data);
                        } else {
                            console.error('Execution of ' + commandStr + ' failed! ' + JSON.stringify(data.error));
                        }
                    }.bind(this),
                    error: function (xhr, status, err) {
                        console.error('Execution of ' + commandStr + ' failed!', status, err.toString());
                    }
                });
            }
        };

        this.executeDefault = function (viewName, file) {
            var id;
            if (m$.data.records) {
                for (id in m$.data.records) {
                    break;
                }
            }
            if (id!==null) {
                m$.data.checked = [file];
                this.executeCommand(viewName, m$.data.records[id].command);
            }
        };

        this.listFolder = function (viewName, path) {
            $.ajax({
                url: '/list/' + path,
                type: 'GET',
                cache: false,
                success: function (data) {
                    if (data.message === 'success') {
                        this.updateView(viewName, data.data);
                    } else {
                        console.error('List of ' + path + ' failed! ' + JSON.stringify(data.error));
                    }
                }.bind(this),
                error: function (xhr, status, err) {
                    console.error('List of ' + path + ' failed! ', status, err.toString());
                }
            });
        };

        this.copyAndListRecords = function () {
            m$.data.checked = [];
            $('input.m-selected:checked').each(function () {
                    m$.data.checked.push($(this).attr('name'));
                }
            );
            this.listRecords('commands', 'home');
        };

        this.toggleSelectAll = function () {
            var checked = $('#m-select-all').prop('checked');
            $('input.m-selected').each(function () {
                    $(this).prop('checked', checked);
                }
            );
        };

        function getOrder(str) {
            if (str.indexOf('desc')===0) {
                return 'desc';
            } else {
                return 'asc';
            }
        }

        function getData(str) {
            if (str.indexOf('desc')===0) {
                return str.substring(4);
            } else if (str.indexOf('asc')===0) {
                return str.substring(3);
            } else {
                return str;
            }
        }

        this.handleSortingEvent = function(e, id) {
            var val = e.options[e.selectedIndex].value;
            $('#id'+id+' .m-sortable').tsort({data: 'sort-' + getData(val), order: getOrder(val)});
        };

        this.sortInitial = function(id) {
            $('#id'+id+' .m-sortable').tsort({data: 'sort-name', order: 'asc'});
        }
    }

    m$ = new C();
    m$.data = {};
    m$.data.checked = [];
}());

$(function () {
    $(document).ajaxSend(function(event, request, settings) {
        $('#loading-indicator').show();
    });

    $(document).ajaxComplete(function(event, request, settings) {
        $('#loading-indicator').hide();
    });

    m$.listRecords('commands', 'home');
});