(function () {
    function C() {
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
                        console.error('Creation of ' + JSON.stringify(record) + ' failed! ' + data.error);
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
                        console.error('Update of ' + JSON.stringify(record) + ' failed! ' + data.error);
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
                    console.error('Deletion of ' + id + ' failed! ' + data.error);
                }
            });
        };

        this.expandCommand = function(commandStr) {
            var allFiles = '';
            var checkedFiles = m$.data.checked;
            if (m$.data.pwd === undefined) {
                m$.data.pwd = '/';
            }
            if(/\$pwd/.test(commandStr)) {
                commandStr = commandStr.replace(/\$pwd/g, m$.data.pwd);
            }
            if(/\$all/.test(commandStr)) {
                if (checkedFiles && checkedFiles.length > 0) {
                    allFiles = '"' + checkedFiles.join('" "') + '"';
                }
                commandStr = commandStr.replace(/\$all/g, allFiles);
            }
            var tmp = "";
            if(/\$each/.test(commandStr)) {
                for(var i=0; i<checkedFiles.length; i++) {
                    tmp = tmp + commandStr.replace(/\$each/g, '"'+checkedFiles[i]+'"') + ';';
                }
                commandStr = tmp;
            }
            return commandStr;
        };

        this.executeCommand = function (viewName, commandStr) {
            commandStr = this.expandCommand(commandStr);
            if (commandStr.indexOf('m-open') === 0) {
                this.listFolder('finder', commandStr.substring(commandStr.indexOf(' ')).trim());
            } else {
                console.log(commandStr);
                $.ajax({
                    url: '/shell/',
                    type: 'POST',
                    cache: false,
                    data: {command: commandStr},
                    dataType: 'json',
                    success: function (data) {
                        if (data.message === 'success') {
                            if (data.data !== '')
                                this.updateView(viewName, data.data);
                        } else {
                            console.error('Execution of ' + commandStr + ' failed! ' + data.error);
                        }
                    }.bind(this),
                    error: function (xhr, status, err) {
                        console.error('Execution of ' + commandStr + ' failed!', status, err.toString());
                    }
                });
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
                        console.error('List of ' + path + ' failed! ' + data.error);
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

        this.addSortingControls = function(id) {
            setTimeout(function(){$('#id'+id).jqmts({
                useNativeMenu: false,
                showCounts: false,
                className: 'class'+id,
                attributes: {name: 'Sort by Name', creation: 'Sort by Creation Time', size: 'Sort by Size'}
            })}, 0);
        };
    }

    m$ = new C();
    m$.data = {};
}());

$(function () {
    m$.listRecords('commands', 'home');
});