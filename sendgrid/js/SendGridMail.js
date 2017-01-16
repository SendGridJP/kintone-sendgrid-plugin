jQuery.noConflict();

(function($, PLUGIN_ID) {
  'use strict';
  //Config key
  var config = kintone.plugin.app.getConfig(PLUGIN_ID);
  //User Information
  var userInfo = kintone.getLoginUser();
  //appId
  var appId = kintone.app.getId();

  // Event : Record show
  kintone.events.on('app.record.index.show', function(event) {
    if ($('#send_mail').length > 0) {
      return;
    }
    // Label on HeaderMenuSpace
    var labelIcon = $('<i />', {
      text: 'mail',
      'class': 'material-icons vertical-align-middle'
    });
    var labelText = (userInfo.language === 'ja') ? 'テンプレート' : 'Template';
    var labelTemplate = $('<a />', {
      text: labelText,
      href: 'https://sendgrid.com/templates',
      target: '_blank',
      'class': 'header-menu-item'
    });
    $(kintone.app.getHeaderMenuSpaceElement('buttonSpace'))
      .append(labelIcon)
      .append(labelTemplate);

    // Template Select on HeaderMenuSpace
    var templateOuter = $('<div />', {
      'class': 'kintoneplugin-select-outer header-menu-item header-menu-item-middle'
    });
    var templateDiv = $('<div />', {
      'class': 'kintoneplugin-select'
    });
    var templateSpace = $('<select />', {
      id: 'temp_select'
    });
    templateDiv.append(templateSpace);
    templateOuter.append(templateDiv);
    $(kintone.app.getHeaderMenuSpaceElement()).append(templateOuter);

    // Get Templates
    var templates = getTemplates().then(function(templates){
      for (var m = 0; m < templates.length; m++) {
        var template = templates[m];
        for (var n = 0; n < template.versions.length; n++) {
          var version = template.versions[n];
          if (version.active === 1) {
            var selected = (config.templateId === template.id);
            var option = $('<option />', {
              value: template.id,
              text: template.name,
              selected: selected,
              'class': 'goog-inline-block goog-menu-button-inner-box'
            });
            templateSpace.append(option);
          }
        }
      }
    });

    // Send Button on HeaderMenuSpace
    var records = event.records;
    var sendIcon = $('<i />', {
      'class': 'material-icons vertical-align-middle',
      text: 'send'
    });
    var buttonClass = (records.length === 0) ? 'header-menu-item kintoneplugin-button-small-disabled' : 'header-menu-item kintoneplugin-button-small';
    var sendButton = $('<button />', {
      id: 'send_mail',
      'class': buttonClass
    });
    sendButton.append(sendIcon);
    $(kintone.app.getHeaderMenuSpaceElement('buttonSpace')).append(sendButton);

    // Send Mail
    if (records.length > 0) {
      $('#send_mail').on('click', function() {
        // confirm before send
        var title = 'Are you sure?';
        var cancelButtonText = 'Cancel';
        var confirmButtonText = 'Send';
        if (userInfo.language === 'ja') {
          title = 'メールを送信しますか？';
          cancelButtonText = 'キャンセル';
          confirmButtonText = '送信';
        }
        swal({
          title: title,
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: confirmButtonText,
          cancelButtonText: cancelButtonText,
        }).then(function() {
          // send mail
          var condition= kintone.app.getQueryCondition();
          kintone.api(
            '/k/v1/records', 'GET',
            {app: appId, query: condition, totalCount: true},
            function(resp){
              var limit = 500;
              var reqNums = Math.ceil(resp.totalCount / limit);
              for (var i = 0; i < reqNums; i++) {
                var offset = i * limit;
                var condition　= kintone.app.getQueryCondition();
                processRecords(appId, condition, limit, offset);
              }
            }
          );
        }).catch(swal.noop);
      });
    }
  });

  // Get Templates
  function getTemplates() {
    var url = 'https://api.sendgrid.com/v3/templates';
    return kintone.plugin.app.proxy(PLUGIN_ID, url, 'GET', {}, {}).then(function(resp) {
      var response = JSON.parse(resp[0]);
      if (response.templates.length > 0 && response.errors === undefined) {
        return response.templates;
      }
      console.log('getTemplates: Fail: ' + JSON.stringify(response.errors));
      return [];
    }, function(e) {
      console.log('getTemplates: Fail: ' + JSON.stringify(e));
      return [];
    });
  }

  //　Handle Many Records
  function processRecords(appId, condition, limit, offset) {
    condition = condition + ' limit ' + limit + ' offset ' + offset;
    kintone.api(
      '/k/v1/records', 'GET',
      {app: appId, query: condition},
      function(resp){
        sendMail(makeParams(resp.records, config));
      }
    );
  }

  // Make Mail Send Parameters
  function makeParams(records, config) {
    var param = {};
    var personalizations = [];
    for (var i = 0; i < records.length; i++) {
      var personalization = {};
      personalization.to = [];
      personalization.to.push({'email': records[i][config.emailFieldCode].value});
      personalization.substitutions = {};
      for (var k = 0; k < config.subNumber; k++) {
        personalization.substitutions[config['val'+k]] = records[i][config['code'+k]].value;
      }
      personalizations.push(personalization);
    }
    param.personalizations = personalizations;
    param.from = {'email': config.from, 'name': config.fromName};
    param.template_id = $('#temp_select').val();
    return param;
  }

  //Send mail function
  function sendMail(param) {
    var url = 'https://api.sendgrid.com/v3/mail/send';
    var method = 'POST';
    var data = JSON.stringify(param);
    return kintone.plugin.app.proxy(PLUGIN_ID, url, method, {}, data).then(function(resp) {
      var response = resp[0];
      var status = resp[1];
      if (status < 400) {
        var mesSuccess = 'A request for mail sending was success.';
        if (userInfo.language === 'ja') {
          mesSuccess = 'メールの送信リクエストに成功しました。';
        }
        swal('Complete', mesSuccess, 'success');
        return;
      } else {
        var mesFail = 'A request for mail sending was failed. Status code:' + status + '. Response:' + response;
        if (userInfo.language === 'ja') {
          mesFail = 'メールの送信リクエストに失敗しました。Status code:' + status + '。Response:' + response;
        }
        swal('Failed', mesFail, 'error');
        return;
      }
    }, function(e) {
      swal('Failed', 'Mail sending was failed.' + JSON.stringify(e), 'error');
      return e;
    });
  }

  kintone.events.on('app.record.index.edit.submit', function(event) {
    var title = 'Before mail will be sending, reloading is required.';
    var message = 'Reloading is required';
    if (userInfo.language === 'ja') {
      title = 'メールを送信する前に画面をリロードしてください';
      message = 'メールリストの反映にはリロードが必要です';
    }
    swal(title, message, 'warning');
  });
})(jQuery, kintone.$PLUGIN_ID);
