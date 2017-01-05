(function(PLUGIN_ID) {
    'use strict';
    // Config key
    var config = kintone.plugin.app.getConfig(PLUGIN_ID);
    // User Information
    var userInfo = kintone.getLoginUser();
    // appId
    var appId = kintone.app.getId();
    // Create record
    function createSubmit(event) {
      var record = event.record;
      console.log(JSON.stringify(record));
      var url = 'https://api.sendgrid.com/v3/contactdb/recipients';
      var method = 'POST';
      var headers = {};
      headers['Content-Type'] = 'application/json';
      var item = {};
      for (var key in record) {
        console.log("obj." + key + " = " + record[key]);
        item[key] = record[key].value;
      }
      console.log(JSON.stringify(item));
      var data = JSON.stringify([item]);
      console.log("createSubmit: contactdb");
      return kintone.plugin.app.proxy(PLUGIN_ID, url, method, headers, data).then( function(resp) {
        console.log("createSubmit: success: message: " + resp[0]);
        console.log("createSubmit: success: code   : " + resp[1]);
        console.log("createSubmit: success: hoge   : " + JSON.stringify(resp[2]));
        if (resp[1] < 400) {
          // Success
          return swal('Success', 'hoge', 'success').then(function() {
            return event;
          });
        } else {
          var mesFail = 'SendGrid Error: Add recipient was failed. Status code:' + resp[1] + '. Response:' + resp[0];
          if (userInfo.language === 'ja') {
            mesFail = 'SendGridエラー: 宛先の登録に失敗しました。Status code:' + resp[1] + '。Response:' + resp[0];
          }
          return swal('Failed', mesFail, 'error').then(function() {
            return event;
          });
        }
      }, function(e) {
        swal('Failed', 'Mail sending was failed.', 'error');
        return event;
      });
    }
    kintone.events.on('app.record.create.submit', function(event) {
      return createSubmit(event);
    });
    kintone.events.on('mobile.app.record.create.submit', function(event) {
      return createSubmit(event);
    });
})(kintone.$PLUGIN_ID);
