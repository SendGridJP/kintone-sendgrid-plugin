jQuery.noConflict();

var STRINGS = {
  'ja': {
    'template_label': 'テンプレート',
    'confirm_sending': 'メールを送信しますか？',
    'cancel': 'キャンセル',
    'send': '送信',
    'request_successed': 'メールの送信リクエストに成功しました。',
    'request_failed': 'メールの送信リクエストに失敗しました。',
    'kintone_error': 'Kintoneエラー。',
    'warning_sending_title': 'メールを送信する前に画面をリロードしてください',
    'warning_sending_message': 'メールリストの反映にはリロードが必要です'
  },
  'default': {
    'template_label': 'Template',
    'confirm_sending': 'Do you send emails?',
    'cancel': 'Cancel',
    'send': 'Send',
    'request_successed': 'Your requests for mail sending were successful.',
    'request_failed': 'Your requests for mail sending were failed.',
    'kintone_error': 'Kintone error.',
    'warning_sending_title': 'Before mail will be sending, reloading is required.',
    'warning_sending_message': 'Reloading is required'
  }
};

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
  //
  var lang = userInfo.language;

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
    var labelText = getStrings(lang, 'template_label');;
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

    var templateGeneration = config.templateGeneration;
    if (!config.templateGeneration) {
      templateGeneration = 'legacy';
    }

    // Get Templates
    var templates = getTemplates(templateGeneration).then(function(templates){
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
        var title = getStrings(lang, 'confirm_sending');
        var cancelButtonText = getStrings(lang, 'cancel');
        var confirmButtonText = getStrings(lang, 'send');
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
            kintone.api.url('/k/v1/records', true), 'GET',
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
    kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {app: appId, query: newCondition})
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
    var mesSuccess = getStrings(lang, 'request_successed');
    var mesFail = getStrings(lang, 'request_failed');
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
    var message = getStrings(lang, 'kintone_error');
    message = message + '<br />status: ' + respKintone.code;
    message = message + '<br />message: ' + respKintone.message;
    swal('Failed', message, 'error');
  }

  // Make Mail Send Parameters
  function makeParams(records, config, sandbox_mode) {
    var param = {};
    var personalizations = [];
    var templateGeneration = config.templateGeneration;
    if (!config.templateGeneration) {
      templateGeneration = 'legacy';
    }
    if (templateGeneration === 'legacy') {
      // Legacy Transactional Template
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
    } else {
      // Dynamic Transactional Template
      for (var i = 0; i < records.length; i++) {
        // Skip the empty recipients
        if (records[i][config.emailFieldCode].value === '') {
          continue;
        }
        var personalization = {};
        personalization.to = [];
        personalization.to.push({'email': records[i][config.emailFieldCode].value});
        personalization.dynamic_template_data = {};
        for (var k = 0; k < config.dtdNumber; k++) {
          personalization.dynamic_template_data[config['dtd_key_'+k]] = records[i][config['dtd_val_'+k]].value;
        }
        personalizations.push(personalization);
      }
    }
    param.personalizations = personalizations;
    param.from = {'email': config.from, 'name': config.fromName};
    param.template_id = $('#temp_select').val();
    param.mail_settings = {};
    param.mail_settings.sandbox_mode = {'enable': sandbox_mode};
    if (config.contentType === 'text/plain') {
      param.content = [];
      param.content.push({'type': 'text/plain', 'value': ' '});
    }
    //console.log(JSON.stringify(param));
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
  function getTemplates(generation) {
    var url = 'https://api.sendgrid.com/v3/templates?generations=' + generation;
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
    var title = getStrings(lang, 'warning_sending_title');
    var message = getStrings(lang, 'warning_sending_message');
    swal(title, message, 'warning');
    return event;
  });

  function getStrings(language, key) {
    var value = '';
    if (language in STRINGS) {
      value = STRINGS[language][key];
    } else {
      value = STRINGS.default[key];
    }
    return value;
  }
})(jQuery, kintone.$PLUGIN_ID);
