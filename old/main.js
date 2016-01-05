var EVENTS = {};

var Home = React.createClass({
    getInitialState: function () {
        return {data: {length: 0, records: {}}};
    },
    loadCommandsFromServer: function () {
        $.ajax({
            url: '/crud/commands/',
            type: 'GET',
            cache: false,
            success: function (data) {
                console.log(JSON.stringify(data));
                if (data.message === 'success') {
                    this.setState({data: data.data});
                } else {
                    console.error('crud/commands/');
                }
            }.bind(this),
            error: function (xhr, status, err) {
                console.error('/crud/commands/', status, err.toString());
            }.bind(this)
        });
    },
    componentDidMount: function () {
        this.loadCommandsFromServer();
        $(EVENTS).on('add-record', function (type, record) {
            console.log("Adding " + JSON.stringify(record));
            $.ajax({
                url: '/crud/commands/',
                type: 'POST',
                cache: false,
                data: record,
                dataType: 'json',
                success: function (data) {
                    if (data.message === 'success') {
                        this.loadCommandsFromServer();
                    } else {
                        console.error('crud/commands/ add');
                    }
                }.bind(this),
                error: function (xhr, status, err) {
                    console.error('/crud/commands/', status, err.toString());
                }.bind(this)
            });
        }.bind(this));
        $(EVENTS).on('save-record', function (type, record) {
            console.log("Saving " + JSON.stringify(record));
            $.ajax({
                url: '/crud/commands/' + record._id + '/',
                type: 'PUT',
                cache: false,
                data: record,
                dataType: 'json',
                success: function (data) {
                    if (data.message === 'success') {
                        this.loadCommandsFromServer();
                    } else {
                        console.error('crud/commands/ save');
                    }
                }.bind(this),
                error: function (xhr, status, err) {
                    console.error('/crud/commands/', status, err.toString());
                }.bind(this)
            });

        }.bind(this));
    },
    deleteItem: function (index) {
        $.ajax({
            url: '/crud/commands/' + index + '/',
            type: 'DELETE',
            cache: false,
            success: function (data) {
                if (data.message === 'success') {
                    this.loadCommandsFromServer();
                } else {
                    console.error('crud/commands/ delete');
                }
            }.bind(this),
            error: function (xhr, status, err) {
                console.error('/crud/commands/', status, err.toString());
            }.bind(this)
        });
        return false;
    },
    editItem: function (index) {
        $(EVENTS).trigger('change-view', 'AddCommand');
        $(EVENTS).trigger('load-record', {
            _id: index,
            name: this.state.data.records[index].name,
            command: this.state.data.records[index].command
        });
        return false;
    },
    addItem: function () {
        $(EVENTS).trigger('change-view', 'AddCommand');
        $(EVENTS).trigger('load-record', {
            _id: "",
            name: "",
            command: ""
        });
    },
    executeCommand: function (id) {
        $.ajax({
            url: '/shell/',
            type: 'POST',
            cache: false,
            data: {command: this.state.data.records[id].command},
            dataType: 'json',
            success: function (data) {
                if (data.message === 'success') {
                    $(EVENTS).trigger('change-view', 'ShellOutput');
                    $(EVENTS).trigger('shell-output', data.data);
                } else {
                    console.error('crud/commands/ add');
                }
            }.bind(this),
            error: function (xhr, status, err) {
                console.error('/crud/commands/', status, err.toString());
            }.bind(this)
        });
    },
    render: function () {
        console.log(JSON.stringify(this.state));
        var commandNodes = Object.keys(this.state.data.records).map(function (key) {
            var record = this.state.data.records[key];
            return (
                <div className="list-group-item" key={record._id} >
                    <span onClick={this.executeCommand.bind(this, record._id)}> {record.name} </span>
                    <span className="glyphicon glyphicon-trash pull-right" onClick={this.deleteItem.bind(this, record._id)}></span>
                    <span className="glyphicon glyphicon-edit pull-right" style={{marginRight: '10px'}} onClick={this.editItem.bind(this, record._id)}></span>
                </div>);
        }.bind(this));

        return (
            <div>
                <div className="nav navbar navbar-default navbar-fixed-top">
                    <div className="container-fluid">
                        <button className="btn btn-default navbar-btn navbar-left" onClick={this.addItem}>
                            <span className="glyphicon glyphicon-plus" ></span>
                            Add
                        </button>
                        <button className="btn btn-default navbar-btn navbar-left" onClick={this.loadCommandsFromServer}>
                            <span className="glyphicon glyphicon-refresh" ></span>
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="container-fluid">
                    <div>
                        <p> &nbsp; </p>
                    </div>
                    <div className="list-group">
                    {commandNodes}
                    </div>
                </div>

                <div
                    className = "nav navbar navbar-default navbar-fixed-bottom" >
                    <div className="container-fluid">
                        <button className="btn btn-default navbar-btn navbar-left">
                            <span className="glyphicon glyphicon-home"></span>
                            Home
                        </button>
                    </div>
                </div>
            </div>
        )
            ;
    }
});

var AddCommand = React.createClass({
    handleCancel: function () {
        console.log("Triggered cancel");
        $(EVENTS).trigger('change-view', 'Home');
    },
    handleAdd: function () {
        var record = {name: this.refs.fieldName.value, command: this.refs.fieldCommand.value};
        var id = this.refs.fieldId.value;

        console.log("To save " + JSON.stringify(record) + " id = :" + id + ":");
        $(EVENTS).trigger('change-view', 'Home');
        if (id === '') {
            $(EVENTS).trigger('add-record', record);
        } else {
            record._id = id;
            $(EVENTS).trigger('save-record', record);
        }
    },
    componentDidMount: function () {
        $(EVENTS).on('load-record', function (type, record) {
            this.refs.fieldId.value = record._id;
            this.refs.fieldName.value = record.name;
            this.refs.fieldCommand.value = record.command;
        }.bind(this));
    },
    render: function () {
        return (
            <form className="form-horizontal" action="">
                <input ref='fieldId' type='hidden'/>
                <div className='form-group'>
                    <label className='col-sm-2 control-label'> Name </label>
                    <div className='col-sm-10'>
                        <input ref='fieldName' className='form-control' type="text" placeholder="Name" />
                    </div>
                </div>
                <div className='form-group'>
                    <label className='col-sm-2 control-label'> Command </label>
                    <div className='col-sm-10'>
                        <input ref='fieldCommand' className='form-control' type="text" placeholder="command" />
                    </div>
                </div>
                <div className='form-group'>
                    <div className='col-sm-offset-2 col-sm-10'>
                        <button className='btn btn-default' onClick={this.handleCancel} type='button'>
                            Cancel
                        </button>
                        <span> &nbsp; &nbsp; </span>
                        <button className='btn btn-default' onClick={this.handleAdd} type="button">
                            Save
                        </button>
                    </div>
                </div>
            </form>
        );
    }
});

var ShellOutput = React.createClass({
    getInitialState: function () {
        return {
            data: ""
        };
    },
    componentDidMount: function () {
        $(EVENTS).on('shell-output', function (type, output) {
            this.setState({data: output});
        }.bind(this));
    },
    goBack: function () {
        $(EVENTS).trigger('change-view', 'Home');
    },
    render: function () {
        return (
            <div>
                <div className="nav navbar navbar-default navbar-fixed-top">
                    <div className="container-fluid">
                        <button className="btn btn-default navbar-btn navbar-left" onClick={this.goBack}>
                            <span className="glyphicon glyphicon-home" ></span>
                            Home
                        </button>
                    </div>
                </div>
                <p> &nbsp;&nbsp;</p>
                <pre>{this.state.data}</pre>
            </div>
        );
    }
});

var Finder = React.createClass({
    getInitialState: function () {
        return {data: {parent: '/', pwd: '/', folders: {}}};
    },
    loadFolderFromServer: function (path) {
        $.ajax({
            url: '/list/' + path,
            type: 'GET',
            cache: false,
            success: function (data) {
                console.log(JSON.stringify(data));
                if (data.message === 'success') {
                    this.setState({data: data.data});
                } else {
                    console.error('/list/' + path + " failed!");
                }
            }.bind(this),
            error: function (xhr, status, err) {
                console.error('/list/' + path + " failed!", status, err.toString());
            }.bind(this)
        });
    }, //                            span.glyphicon.glyphicon-file
    componentDidMount: function () {
        this.loadFolderFromServer(this.state.data.pwd);
    },
    handleSelectionClick: function(key) {
        setState({})
    },
    render: function () {
        var commandNodes = Object.keys(this.state.data.folders).map(function (key) {
            var record = this.state.data.folders[key];
            record.selected = false;
            return (
                <div className="list-group-item" data-sort-name={key} data-sort-size={record.size} data-sort-creation={record.birthtime}>
                    <input className="f-selected" type='checkbox' name={key} checked={record.selected}/>
                    <span> &nbsp; &nbsp; &nbsp; </span>
                    <span className="glyphicon glyphicon-folder-open"></span>
                    <span onClick={this.loadFolderFromServer.bind(this, record.url)} >&nbsp; {key}</span>
                </div>);
        }.bind(this));

        return (
            <div>
                <div className="nav navbar navbar-default navbar-fixed-top">
                    <div className="container-fluid">
                        <a className="btn btn-default navbar-btn navbar-left" href="#" onClick={this.loadFolderFromServer.bind(this, this.state.data.parent)}>
                            <span className="glyphicon glyphicon-arrow-up"></span>
                            UP
                        </a>
                        <b className="navbar-text overflow">
                            {this.state.data.pwd}
                        </b>
                    </div>
                </div>

                <div className="container-fluid">
                    <div>
                        <p> &nbsp; </p>
                    </div>
                    <div className="list-group">
                    {commandNodes}
                    </div>
                </div>

                <div
                    className = "nav navbar navbar-default navbar-fixed-bottom" >
                    <div className="container-fluid">
                        <button className="btn btn-default navbar-btn navbar-left">
                            <span className="glyphicon glyphicon-home"></span>
                            Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }
});

var Page = React.createClass({
    getInitialState: function () {
        return {view: 'Finder'};
    },
    componentDidMount: function () {
        console.log("Registered change-view");
        $(EVENTS).on('change-view', function (type, event) {
            console.log("Received " + event);
            this.setState({view: event});
        }.bind(this));
    },
    render: function () {
        return (
            <div>
                <div style={{display: (this.state.view === 'Home') ? 'inline' : 'none'}}>
                    <Home/>
                </div>
                <div style={{display: (this.state.view === 'AddCommand') ? 'inline' : 'none'}}>
                    <AddCommand/>
                </div>
                <div style={{display: (this.state.view === 'ShellOutput') ? 'inline' : 'none'}}>
                    <ShellOutput/>
                </div>
                <div style={{display: (this.state.view === 'Finder') ? 'inline' : 'none'}}>
                    <Finder/>
                </div>
            </div>
        );
    }
});

ReactDOM.render(
    <Page />,
    document.getElementById('content')
);


