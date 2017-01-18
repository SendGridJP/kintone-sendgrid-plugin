jQuery.noConflict();

(function($, PLUGIN_ID) {
  'use strict';
  // Config key
  var config = kintone.plugin.app.getConfig(PLUGIN_ID);
  // User Information
  var userInfo = kintone.getLoginUser();
  // appId
  var appId = kintone.app.getId();

  // Event : Record show
  kintone.events.on('app.record.index.show', function(event) {
    if ($('#upload_mc').length > 0) {
      return;
    }
    // Buttons on HeaderMenuSpace
    if (config.useMc === 'true') {
      var records = event.records;
      var buttonClass = (records.length === 0) ? 'header-menu-item kintoneplugin-button-small-disabled' : 'header-menu-item kintoneplugin-button-small';
      var button = $('<button />', {
        id: 'upload_mc',
        'class' : buttonClass
      });
      var icon = $('<i />', {
        text: 'cloud_upload',
        'class': 'material-icons vertical-align-middle'
      });
      button.append(icon);
      $(kintone.app.getHeaderMenuSpaceElement()).append(button);
      // Click Event
      $('#upload_mc').on('click', function() {
        if (records.length > 0) {
          console.log('click upload_mc');
          // confirm before upload to MC
          var title = 'Are you sure?';
          var cancelButtonText = 'Cancel';
          var confirmButtonText = 'Upload';
          if (userInfo.language === 'ja') {
            title = 'マーケティングキャンペーン機能の宛先リストにアップロードしますか？';
            cancelButtonText = 'キャンセル';
            confirmButtonText = 'アップロード';
          }
          swal({
            title: title,
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: confirmButtonText,
            cancelButtonText: cancelButtonText,
          }).then(function() {
            // upload to MC
            var condition = kintone.app.getQueryCondition();
            return kintone.api(
              '/k/v1/records', 'GET',
              {app: appId, query: condition, totalCount: true}
            ).then(function(resp) {
              return getReservedFields().then(function(fields) {
                return getCustomFields(fields).then(function(fields) {
                  var limit = 500;
                  var reqNums = Math.ceil(resp.totalCount / limit);
                  for (var i = 0; i < reqNums; i++) {
                    var offset = i * limit;
                    var condition　= kintone.app.getQueryCondition();
                    processRecords(appId, condition, limit, offset, fields);
                  }
                });
              });
            });
          });
        }
      });
    }
  });

  //　Handle Many Records
  function processRecords(appId, condition, limit, offset, fields) {
    condition = condition + ' limit ' + limit + ' offset ' + offset;
    return kintone.api(
      '/k/v1/records', 'GET',
      {app: appId, query: condition}
    ).then(function(resp) {
      postRecipients(resp.records, config, fields);
    });
  }

  function postRecipients(records, config, fields) {
    console.log('postRecipients: records.length: ' + records.length);
    console.log('postRecipients: records: ' + JSON.stringify(records));
    console.log('postRecipients: config: ' + JSON.stringify(config));
    console.log('postRecipients: fields: ' + JSON.stringify(fields));
    var items = [];
    for (var i = 0; i < records.length; i++) {
      var record = records[i];
      console.log('postRecipients: record: ' + JSON.stringify(record));
      var item = {};
      for (var key in record) {
        // Field name must be alphanumeric
        if (key.match(/^[a-zA-Z0-9/_]+$/) !== null) {
          for (var j = 0; j < fields.length; j++) {
            if (fields[j].name === key) {
              item[key] = record[key].value;
              break;
            }
          }
        }
      }
      items.push(item);
    }
    console.log('postRecipients: request: ' + JSON.stringify(items));
    var url = 'https://api.sendgrid.com/v3/contactdb/recipients';
    var data = JSON.stringify(items);
    return kintone.plugin.app.proxy(PLUGIN_ID, url, 'POST', {}, data).then(function(resp) {
      var response = JSON.parse(resp[0]);
      var status = resp[1];
      console.log('postRecipients: response: Status code:' + status + '. Response:' + JSON.stringify(response));
      if (status == 201 && response.error_count === 0) {
        return Promise.resolve('success');
      }
      return Promise.reject('post failed: ' + status + ', ' + JSON.stringify(response));
    }, function(e) {
      return Promise.reject('Unknown error: ' + JSON.stringify(e));
    });
  }

  // Get Reserved Fields
  function getReservedFields() {
    var url = 'https://api.sendgrid.com/v3/contactdb/reserved_fields';
    return kintone.plugin.app.proxy(PLUGIN_ID, url, 'GET', {}, {}).then(function(resp) {
      console.log('getReservedFields: ' + resp[0]);
      return JSON.parse(resp[0]).reserved_fields;
    }, function(e) {
      swal('Failed', 'Mail sending was failed.', 'error');
      return e;
    });
  }

  // Get Custom Fields
  function getCustomFields(fields) {
    var url = 'https://api.sendgrid.com/v3/contactdb/custom_fields';
    return kintone.plugin.app.proxy(PLUGIN_ID, url, 'GET', {}, {}).then(function(resp) {
      console.log('getCustomFields: ' + resp[0]);
      return fields.concat(JSON.parse(resp[0]).custom_fields);
    }, function(e) {
      swal('Failed', 'Mail sending was failed.', 'error');
      return e;
    });
  }

  // Create record
  function addRecipients(event, fields) {
    var record = event.record;
    // var record = {
    //   "email":{"type":"LINK","value":"wataru6@kke.co.jp"},
    //   "文字列__1行_":{"type":"SINGLE_LINE_TEXT","value":"kaisha"},
    //   "age":{"type":"NUMBER","value":"nenrei"},
    //   "文字列__1行__0":{"type":"SINGLE_LINE_TEXT","value":"namae"},
    //   "link":{"type":"LINK","value":"link"},
    //   "sdfasdfasdf":{"type":"SINGLE_LINE_TEXT","value":"aa"},
    //   "文字列__1行__1":{"type":"SINGLE_LINE_TEXT","value":"hoge"},
    //   "card_number":{"type":"NUMBER","value":35},
    //   // "meter_number":{"type":"SINGLE_LINE_TEXT","value":"hello"}
    // };

    console.log('createSubmit: record: ' + JSON.stringify(record));
    var item = {};
    for (var key in record) {
      // Field name must be alphanumeric
      if (key.match(/^[a-zA-Z0-9/_]+$/) !== null) {
        for (var i = 0; i < fields.length; i++) {
          if (fields[i].name === key) {
            item[key] = record[key].value;
            break;
          }
        }
      }
    }
    console.log('createSubmit: request: ' + JSON.stringify(item));
    var url = 'https://api.sendgrid.com/v3/contactdb/recipients';
    var data = JSON.stringify([item]);
    return kintone.plugin.app.proxy(PLUGIN_ID, url, 'POST', {}, data).then(function(resp) {
      var message = JSON.parse(resp[0]);
      var statusCode = resp[1];
      console.log('createSubmit: response: Status code:' + statusCode + '. Response:' + JSON.stringify(message));
      if (statusCode == 201 && message.error_count === 0) return event;
      var swalMessage = 'Status code:' + statusCode + '. Response:' + JSON.stringify(message);
      return swal('Failed', swalMessage, 'error').then(function() {
        return event;
      });
    }, function(e) {
      swal('Failed', 'Mail sending was failed.', 'error');
      return event;
    });
  }

  // kintone.events.on('app.record.create.submit', function(event) {
  //   return createSubmit(event);
  // });
  //
  // kintone.events.on('mobile.app.record.create.submit', function(event) {
  //   return createSubmit(event);
  // });

  // kintone.events.on('app.record.index.show', function(event) {
  //   // createSubmit({});
  // });
  // function createSubmit(event) {
  //   return getReservedFields().then(function(fields) {
  //     return getCustomFields(fields).then(function(fields) {
  //       return addRecipients(event, fields);
  //     });
  //   });
  // }
})(jQuery, kintone.$PLUGIN_ID);
