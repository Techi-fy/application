//$(function () {
//    $('.btnsubmit').on('click', function () {
//        var e = $(this).closest('form');

//        $('.field-error').hide();

//        if (!FieldValidations(e)) {
//            return;
//        }
//        var data = DomDataToObj('.data-container', {});
//        XHRPOSTRequest("/member/add_member", { data: data }, function (result) {
//            showNotification("Data saved", "success");

//        });
//    });
//});

$(function () {
    $('.btnsubmit').on('click', function () {
        var e = $(this).closest('form');

        $('.field-error').hide();

        if (!FieldValidations(e)) {
            return;
        }
        var callback = function () {
            var data = DomDataToObj('.data-container', { documents: Documents });
            data.photo = $('.img-profile').attr('data-filename');
            XHRPOSTRequest("/Member/add_member", { _data: JSON.stringify(data) }, function (result) {
                showNotification("Data saved", "success");
                window.location.replace("/Member/index");

            });
        }
        Validate([
            { table: "[dbo].[pms_member]", column: "username", value: $('[name=username]').val(), ignorecondition: "Id!=" + (getParameterByName('id') || 0), error: "Username Already Exist" },
        ], callback);
    });
});





$(function () {

    InitFileUploader('.documentpanel', { ismultiple: false, title: 'Upload Attachment', AllowMultipleElement: ['PostAmtattach'] });
    _RenderDocument('.tbldocs', Documents)
});


$(document).on('click', '.btnattachdocument', function () {
    ResetAttachModel();
    $('#AttachModal').modal('show');
});

$(document).on('click', '.btnsaveattachdocument', function () {
    var parent = $('#AttachModal');

    $('#AttachModal').modal('hide');
    var files = getFilesObjectArray(parent);


    if (!files.length) { return; }


    var obj = _.where(Documents, { IsActive: true })[0];
    var isAlreadyExist = true;
    if (!obj) {
        obj = { ActualName: files[0].ActualName, Name: files[0].Name };
        Documents.push(obj);
        obj = _.where(Documents, { Name: files[0].Name })[0];
        isAlreadyExist = false;
    }

    var _prename = obj.Name;
    obj.ActualName = files[0].ActualName;
    obj.Name = files[0].Name;
    obj.Title = $('[name=Title]', parent).val();
    obj.Comments = $('[name=Comments]', parent).val();




    $('.tbldocs .norecordrow').remove();
    var tr;
    if (!isAlreadyExist) {
        tr = $('.tbldocs tbody').append('<tr/>').find('tr:last');
    }
    else {
        tr = $('.tbldocs tbody').find('[data-filename="' + _prename + '"]').closest('tr');
        obj.Name = files[0].Name;
        $(tr).html('');
    }
    $(tr).append('<td>' + obj.Title + '</td>');
    $(tr).append('<td>' + (obj.Comments || '') + '</td>');

    var element = CreateFileButton();
    $(element).find('.filename').text(obj.ActualName)
    $(element).attr('data-actualname', obj.ActualName).attr('data-filename', obj.Name);

    if (IsImage(obj.Name)) {
        element = CreateImageOfAttachment(element, obj.Name);
    }

    $(tr).append('<td/>').find('td:last').append(element);
    var _docactions = '';
    _docactions = DocsActionHtml()

    $(tr).append('<td/>').find('td:last').append(_docactions);

});
function DocsActionHtml(id) {
    var td = $('<td>');
    //if (getCurrentPageRole("edit"))
    $(td).append('<span class="pad"><a href="#" class="tblEdit fa fa-edit" style="font-size:200%; padding: 0px 10px 5px 0px;" onclick="return DocEdit(this);" data-toggle="tooltip" data-placement="top" title="Edit"></a></span>');
    // if (getCurrentPageRole("delete"))
    $(td).append(' <span class="pad"><a href="#" class="tblDelete fa fa-trash-o demo3" style="font-size:200%; padding: 0px 10px 5px 0px;" onclick="return DocDelete(this);" data-toggle="tooltip" data-placement="top" title="Delete"></a></span>');

    $(td).append('<input type="hidden" class="dbid" value="' + id + '">');
    return $(td).html();
}
function DocDelete(e) {
    var tr = $(e).closest('tr');
    var filename = $('[data-filename]', tr).attr('data-filename');
    Documents = _.filter(Documents, function (o) { return o.Name.indexOf(filename) });
    $(tr).remove();

    $('.documentcount').html($('.tbldocs tbody tr:not(.norecordrow)').length);
    return false;
}
function DocEdit(e) {
    var filename = $(e).closest('tr').find('[data-filename]').attr('data-filename');
    ShowDocInEdit(filename)
}
function ShowDocInEdit(filename) {
    ResetAttachModel();
    var obj = _.where(Documents, { Name: filename })[0];
    obj.IsActive = true;
    var parent = $('#AttachModal');
    $('[name=Title]', parent).val(obj.Title)
    $('[name=TypeId]', parent).val(obj.TypeId)
    $('[name=Comments]', parent).val(obj.Comments)
    $('#AttachModal').modal('show');
    RenderExistingFiles([{ Name: obj.Name, ActualName: obj.ActualName }], parent);


}
function ResetAttachModel() {
    for (var i = 0; i < Documents.length; i++) {
        Documents[i].IsActive = false;
    }
    $('input[type=text],select,textarea', '#AttachModal').val('');
    $('[data-filename]', '#AttachModal').remove();
}

function _RenderDocument(table, docs) {
    Documents = docs;
    for (var i = 0; i < docs.length; i++) {
        var attach = docs[i];

        $('.norecordrow', table).remove();
        var tr;
        tr = $('tbody', table).append('<tr/>').find('tr:last');
        $(tr).append('<td>' + attach.Title + '</td>');
        $(tr).append('<td>' + (attach.Comment || '') + '</td>');

        var element = CreateFileButton();
        $(element).find('.filename').text(attach.ActualName)
        $(element).attr('data-actualname', attach.ActualName).attr('data-filename', attach.Name);
        //    $(element).find('.filename').text(obj.ActualName)
        //   $(element).attr('data-actualname', obj.ActualName).attr('data-filename', obj.Name);

        if (IsImage(attach.Name)) {
            element = CreateImageOfAttachment(element, attach.Name);
        }

        $(tr).append('<td/>').find('td:last').append(element);


        var _docactions = '';
        _docactions = DocsActionHtml();

        $(tr).append('<td/>').find('td:last').append(_docactions);
    }
}



function choseImage() {
    $('#fup').click();
    return false;
}
$('#fup').on('change', function () {
    for (var i = 0; i < $(this).get(0).files.length; i++) {
        var file = $(this).get(0).files[i];
        if (file) {

            ShowAjaxLoader();

            UploadFile(file, function (result, element) {
                HideAjaxLoader();
                $('.img-profile').attr('src','/public/img/upload/'+ result).attr('data-filename', result);

            });
        }
    }
    $(this).val('');
});