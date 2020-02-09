jQuery.noConflict();

var STRINGS = {
  'ja': {
    'template_label': 'テンプレート',
    'confirm_sending': 'メールを送信しますか？',
    'cancel': 'キャンセル',
    'send': '送信',
    'request_parameters': 'リクエストパラメータ',
    'sandbox_mode': 'サンドボックスモード',
    'sandbox_mode_message': 'メールの送信リクエストのパラメータチェックを行います。メールは送信しません。',
    'request_succeeded': 'メールの送信リクエストに成功しました。',
    'validation_succeeded': 'メールの送信リクエストのチェックに成功しました。',
    'request': 'メールの送信リクエスト',
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
    'request_parameters': 'Request parameters',
    'sandbox_mode': 'Sandbox mode',
    'sandbox_mode_message': 'Validate the parameters for Mail Send API. It doesn\'t send any email.',
    'request_succeeded': 'Your requests for mail sending were successful.',
    'validation_succeeded': 'The validation for Mail Send API parameters were successful.',
    'request': 'Request',
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
  // SendMail progress
  var progress = 0;
  //
  var lang = userInfo.language;

  // Event : Record show
  kintone.events.on('app.record.index.show', async function(event) {
    if ($('#send_mail').length > 0) {
      return event;
    }
    var templateGeneration = config.templateGeneration;
    if (!config.templateGeneration) {
      templateGeneration = 'legacy';
    }
    // Label on HeaderMenuSpace
    var labelIcon = $('<i />', {
      text: 'mail',
      'class': 'material-icons vertical-align-middle'
    });
    var labelText = getStrings(lang, 'template_label');
    var url = 'https://sendgrid.com/templates';
    if (templateGeneration === 'dynamic') {
      url = 'https://mc.sendgrid.com/dynamic-templates';
    }
    var labelTemplate = $('<a />', {
      text: labelText,
      href: url,
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
    var templates = await getTemplates(templateGeneration);
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
    $('#send_mail').on('click', async function() {
      try {
        initProgress();
        if (records.length == 0) return;
        var sandboxMode = (config.sandboxMode.toLowerCase() === 'true');
        var result = await confirmSend(sandboxMode);
        // cancel
        if (!result.value) return;
        // send mail
        var condition= kintone.app.getQueryCondition();
        var resp = await kintone.api(
          kintone.api.url('/k/v1/records', true), 'GET',
          {app: appId, query: condition, totalCount: true}
        );
        await processRecords(condition, 500, 0, resp.totalCount);
        // Finish to send
        if (sandboxMode) {
          Swal.fire('Complete', getStrings(lang, 'validation_succeeded'), 'success');
        } else {
          Swal.fire('Complete', getStrings(lang, 'request_succeeded'), 'success');
        }
      } catch(err) {
        Swal.fire('Failed', err.message, 'error');
      } finally {
        finishProgress();
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

  function confirmSend(sandboxMode) {
    if (sandboxMode) {
      return Swal.fire({
        title: getStrings(lang, 'sandbox_mode'),
        text: getStrings(lang, 'sandbox_mode_message'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: getStrings(lang, 'cancel')
      });
    } else {
      var title = getStrings(lang, 'confirm_sending');
      var cancelButtonText = getStrings(lang, 'cancel');
      var confirmButtonText = getStrings(lang, 'send');
      return Swal.fire({
        title: title,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText,
      });
    }
  }

  // Initialize send mail process
  function initProgress() {
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
  async function processRecords(condition, limit, offset, total) {
    var newCondition = condition + ' limit ' + limit + ' offset ' + offset;
    progress = offset / total;
    updateProgress(progress);
    try {
      var respKintone = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {app: appId, query: newCondition});
    } catch(err) {
      // Handling the kintone Error
      var message = getStrings(lang, 'kintone_error');
      message = message + '<br />status: ' + err.code;
      message = message + '<br />message: ' + err.message;
      throw new Error(message);
    }
    var sandboxMode = (config.sandboxMode.toLowerCase() === 'true');
    var param = makeParams(respKintone.records, config, sandboxMode);
    if (param.personalizations.length > 0) {
      if (sandboxMode) {
        await Swal.fire(
          {
            title: 'Request', icon: 'info', grow: 'row', text: getStrings(lang, 'request'), input: 'textarea', inputValue: JSON.stringify(param, null , 2)
          }
        );
      }
      await sendMail(param);
    }
    var newOffset = offset + limit;
    if (newOffset < total) {
      // continue to send
      return await processRecords(condition, limit, newOffset, total);
    }
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
        var to = {'email': records[i][config.emailFieldCode].value};
        if (config.toNameFieldCode in records[i]) {
          to['name'] = records[i][config.toNameFieldCode].value;
        }
        personalization.to.push(to);
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
        var to = {'email': records[i][config.emailFieldCode].value};
        if (config.toNameFieldCode in records[i]) {
          to['name'] = records[i][config.toNameFieldCode].value;
        }
        personalization.to.push(to);
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
    return param;
  }

  //Send mail function
  async function sendMail(param) {
    var url = 'https://api.sendgrid.com/v3/mail/send';
    var data = JSON.stringify(param);
    var resp = await kintone.plugin.app.proxy(PLUGIN_ID, url, 'POST', {}, data);
    var status = resp[1];
    if (status < 400) return resp;
    var response = JSON.parse(resp[0]);
    var message = getStrings(lang, 'request_failed') + '<br/>' + JSON.stringify(response.errors);
    throw new Error(message);
  }

  // Get Templates
  async function getTemplates(generation) {
    var url = 'https://api.sendgrid.com/v3/templates?generations=' + generation;
    var resp = await kintone.plugin.app.proxy(PLUGIN_ID, url, 'GET', {}, {});
    var response = JSON.parse(resp[0]);
    var status = resp[1];
    if (status < 400) return response.templates;
    throw new Error(JSON.stringify(response.errors));
  }

  kintone.events.on('app.record.index.edit.submit', function(event) {
    var title = getStrings(lang, 'warning_sending_title');
    var message = getStrings(lang, 'warning_sending_message');
    Swal.fire(title, message, 'warning');
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
