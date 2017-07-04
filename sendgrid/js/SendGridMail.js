jQuery.noConflict();

(function($, PLUGIN_ID) {
  'use strict';
  //Config key
  var config = kintone.plugin.app.getConfig(PLUGIN_ID);
  //User Information
  var userInfo = kintone.getLoginUser();
  //appId
  var appId = kintone.app.getId();
  // SendMail results
  var results = [];
  // SendMail progress
  var progress = 0;

  // Event : Record show
  kintone.events.on('app.record.index.show', function(event) {
    if ($('#send_mail').length > 0) {
      return event;
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
    $('#send_mail').on('click', function() {
      if (records.length > 0) {
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
            {app: appId, query: condition, totalCount: true})
          .then(function(resp) {
            initSendMail();
            processRecords(condition, 500, 0, resp.totalCount);
          });
        }).catch(swal.noop);
      }
    });

    // Progress on HeaderMenuSpace
    var progress = $('<progress />', {
      width: '100%',
      id: 'progress',
    });
    progress.hide();
    $(kintone.app.getHeaderMenuSpaceElement('buttonSpace')).append(progress);
    return event;
  });

  // Initialize send mail process
  function initSendMail() {
    results = [];
    progress = 0;
    $('#progress').show();
  }

  function updateProgress(progress) {
    $('#progress').attr('value', progress);
  }

  function finishProgress() {
    $('#progress').hide();
  }

  //　Handle Many Records
  function processRecords(condition, limit, offset, total) {
    var newCondition = condition + ' limit ' + limit + ' offset ' + offset;
    progress = offset / total;
    updateProgress(progress);
    kintone.api('/k/v1/records', 'GET', {app: appId, query: newCondition})
    .then(function(respKintone){
      sendMail(makeParams(respKintone.records, config, false))
      .then(function(respSendMail) {
        var newOffset = offset + limit;
        results.push(respSendMail);
        if (newOffset >= total) {
          showResults(results);
        } else {
          processRecords(condition, limit, newOffset, total);
        }
      })
      .catch(function(respSendMail) {
        results.push(respSendMail);
        showResults(results);
      });
    })
    .catch(function(respKintone) {
      showKintoneError(respKintone);
      return Promise.reject(respKintone);
    });
  }

  function showResults(results) {
    var mesSuccess = 'A request for mail sending was success.';
    if (userInfo.language === 'ja') {
      mesSuccess = 'メールの送信リクエストに成功しました。';
    }
    var mesFail = 'A request for mail sending was failed.';
    if (userInfo.language === 'ja') {
      mesFail = 'メールの送信リクエストに失敗しました。';
    }
    var mesDetail = '';
    var hasFail = false;
    for (var i = 0; i < results.length; i++) {
      var response = results[i][0];
      var status = results[i][1];
      mesDetail = mesDetail + '<br />' + response;
      if (status >= 400) hasFail = true;
    }
    if (hasFail) {
      mesFail = mesFail + '<br />' + mesDetail;
      swal('Failed', mesFail, 'error').catch(swal.noop);
    } else {
      swal('Complete', mesSuccess, 'success').catch(swal.noop);
    }
    finishProgress();
  }

  function showKintoneError(respKintone) {
    var message = 'Kintone error.';
    if (userInfo.language === 'ja') {
      message = 'Kintoneエラー。';
    }
    message = message + '<br />status: ' + respKintone.code;
    message = message + '<br />message: ' + respKintone.message;
    swal('Failed', message, 'error');
  }

  // Make Mail Send Parameters
  function makeParams(records, config, sandbox_mode) {
    var param = {};
    var personalizations = [];
    for (var i = 0; i < records.length; i++) {
      // Skip the empty recipients
      if (records[i][config.emailFieldCode].value === '') {
        continue;
      }
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
    param.mail_settings = {};
    param.mail_settings.sandbox_mode = {'enable': sandbox_mode};
    return param;
  }

  //Send mail function
  function sendMail(param) {
    var url = 'https://api.sendgrid.com/v3/mail/send';
    var data = JSON.stringify(param);
    return kintone.plugin.app.proxy(PLUGIN_ID, url, 'POST', {}, data)
    .then(function(resp) {
      var response = resp[0];
      var status = resp[1];
      if (status < 400) return resp;
      else return Promise.reject(resp);
    })
    .catch(function(resp) {
      return Promise.reject(resp);
    });
  }

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

  kintone.events.on('app.record.index.edit.submit', function(event) {
    var title = 'Before mail will be sending, reloading is required.';
    var message = 'Reloading is required';
    if (userInfo.language === 'ja') {
      title = 'メールを送信する前に画面をリロードしてください';
      message = 'メールリストの反映にはリロードが必要です';
    }
    swal(title, message, 'warning');
    return event;
  });
})(jQuery, kintone.$PLUGIN_ID);
