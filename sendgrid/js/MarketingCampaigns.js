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
          // confirm before upload to MC
          var title = 'Are you sure?';
          var text = 'Upload recipient list to SendGrid Marketing Campaigns?';
          var cancelButtonText = 'Cancel';
          var confirmButtonText = 'Upload';
          if (userInfo.language === 'ja') {
            title = '確認';
            text = 'マーケティングキャンペーン機能の宛先リストにアップロードしますか？';
            cancelButtonText = 'キャンセル';
            confirmButtonText = 'アップロード';
          }
          swal({
            title: title,
            type: 'warning',
            text: text,
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
              return getReservedFields().then(function(sgFields) {
                return getCustomFields(sgFields).then(function(sgFields) {
                  var limit = 500;
                  var reqNums = Math.ceil(resp.totalCount / limit);
                  for (var i = 0; i < reqNums; i++) {
                    var offset = i * limit;
                    var condition　= kintone.app.getQueryCondition();
                    processRecords(appId, condition, limit, offset, sgFields);
                  }
                });
              });
            });
          }, function() {});
        }
      });
    }
  });

  //　Handle Many Records
  function processRecords(appId, condition, limit, offset, sgFields) {
    condition = condition + ' limit ' + limit + ' offset ' + offset;
    return kintone.api(
      '/k/v1/records', 'GET',
      {app: appId, query: condition}
    ).then(function(resp) {
      postRecipients(resp.records, config, sgFields);
    });
  }

  function postRecipients(records, config, sgFields) {
    // console.log('postRecipients: records.length: ' + records.length);
    // console.log('postRecipients: records: ' + JSON.stringify(records));
    // console.log('postRecipients: config: ' + JSON.stringify(config));
    // console.log('postRecipients: sgFields: ' + JSON.stringify(sgFields));
    var items = [];
    for (var i = 0; i < records.length; i++) {
      var record = records[i];
      // console.log('postRecipients: record: ' + JSON.stringify(record));
      var item = {};
      for (var key in record) {
        // Field name must be alphanumeric
        if (key.match(/^[a-zA-Z0-9/_]+$/) !== null) {
          for (var j = 0; j < sgFields.length; j++) {
            if ((sgFields[j].name === key) && SendGrid.matchFieldType(record[key].type, sgFields[j].type)) {
              item[key] = convKn2Sg(record[key].type, sgFields[j].type, record[key].value);
              break;
            }
          }
        }
      }
      items.push(item);
    }
    // console.log('postRecipients: request: ' + JSON.stringify(items));
    var url = 'https://api.sendgrid.com/v3/contactdb/recipients';
    var data = JSON.stringify(items);
    return kintone.plugin.app.proxy(PLUGIN_ID, url, 'POST', {}, data).then(function(resp) {
      var response = JSON.parse(resp[0]);
      var status = resp[1];
      // console.log('postRecipients: response: Status code:' + status + '. Response:' + JSON.stringify(response));
      if (status == 201 && response.error_count === 0) {
        return swal('Complete', 'おしまい', 'success').then(function(resp) {
          return Promise.resolve('success');
        });
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
      // console.log('getReservedFields: ' + resp[0]);
      return JSON.parse(resp[0]).reserved_fields;
    }, function(e) {
      swal('Failed', 'Mail sending was failed.', 'error');
      return e;
    });
  }

  // Get Custom Fields
  function getCustomFields(sgFields) {
    var url = 'https://api.sendgrid.com/v3/contactdb/custom_fields';
    return kintone.plugin.app.proxy(PLUGIN_ID, url, 'GET', {}, {}).then(function(resp) {
      // console.log('getCustomFields: ' + resp[0]);
      return sgFields.concat(JSON.parse(resp[0]).custom_fields);
    }, function(e) {
      swal('Failed', 'Mail sending was failed.', 'error');
      return e;
    });
  }

  // Convert value from kintone to sendgrid
  function convKn2Sg(knType, sgType, knValue) {
    // console.log('convKn2Sg: knType: ' + knType + ', sgType: ' + sgType + ', knValue: ' + knValue);
    switch (knType) {
      case 'DATE':
      case 'UPDATED_TIME':
      case 'CREATED_TIME':
      case 'DATETIME':
        if (!knValue) return null;
        return moment(knValue).format('MM/DD/YYYY');
      case 'RECORD_NUMBER':
      case 'CALC':
      case 'NUMBER':
        if (!knValue) return null;
        return Number(knValue);
      default:
        if (!knValue) return "";
        return knValue;
    }
  }
})(jQuery, kintone.$PLUGIN_ID);
