
function updateList(list) {
    $('#crud-listall').find('a').remove();
    $.each(list, function(index, element) {
        if (element) {
            $('#crud-listall').append('<a class="list-group-item" href="#">' +
            '<span>' + element.name + '</span>' +
            '<span class="glyphicon glyphicon-trash pull-right" onclick="javascript:deleteRecord(' + element._id + '); return false;"></span>' +
            '<span class="glyphicon glyphicon-edit pull-right" style="margin-right: 10px;" onclick="javascript:retrieveRecord(' + element._id + '); return false;"></span>' +
            '</a>');
        }
    });

}

function refreshList() {
    $.get('/crud/commands/', function(data) {
        updateList(data.data);
    });
}

function deleteRecord(id) {
    $.ajax({
        url: '/crud/commands/'+id+'/',
        type: 'DELETE',
        success: function(data) {
            refreshList();
        }
    });
}

function save() {
    var record = {name: $('#field-name').val(), command: $('#field-command').val()};
    var id = $('#field-id').val();

    if (id === '') {
        $.post('/crud/commands/', record, function (data) {
            refreshList();
            showHome();
        });
    } else {
        record._id = id;
        $.ajax({
            url: '/crud/commands/'+id+'/',
            type: 'PUT',
            data: record,
            dataType: 'json',
            success: function(data) {
                refreshList();
                showHome();
            }
        });
    }
}

function retrieveRecord(id) {
    $.get('/crud/commands/'+id+'/', function(data) {
        $('#field-id').val(data.data._id);
        $('#field-name').val(data.data.name);
        $('#field-command').val(data.data.command);
        showEdit();
    });
}

function addRecord() {
    $('#field-id').val("");
    $('#field-name').val("");
    $('#field-command').val("");
    showEdit();
}

function showEdit() {
    $('#crud-listall').css('display', 'none');
    $('#crud-add').css('display', 'none');
    $('#crud-refresh').css('display', 'none');
    $('#crud-edit').css('display', 'block');
}

function showHome() {
    $('#crud-listall').css('display', 'block');
    $('#crud-add').css('display', 'block');
    $('#crud-refresh').css('display', 'block');
    $('#crud-edit').css('display', 'none');
}


$(function(){
    refreshList();
    $('#crud-add').click(addRecord);
    $('#crud-refresh').click(refreshList);
    $('#button-cancel').click(showHome);
    $('#button-save').click(save);
});

