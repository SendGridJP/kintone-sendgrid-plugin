jQuery.noConflict();

var STRINGS = {
  'ja': {
    'title_label': 'SendGrid プラグイン設定画面',
    'general_settings_label': '共通設定',
    'spot_send_settings_label': '送信設定',
    'auth_sub_title_label': '認証設定',
    'auth_container_label': 'APIキー',
    'auth_help_label': 'SendGrid のAPIキーを入力してください。詳細は',
    'auth_link': 'https://sendgrid.kke.co.jp/docs/Tutorials/A_Transaction_Mail/manage_api_key.html',
    'auth_link_label': 'こちら',
    'auth_permission_label': '必要なパーミッション',
    'email_sub_title_label': 'メール設定',
    'email_from_name_container_label': 'From表示名',
    'email_to_help_label': '「文字列(1行)」フィールドか「リンク」フィールド(入力種別＝メールアドレス)より選択してください。',
    "email_to_name_container_label": 'To表示名',
    'email_to_name_help_label': '「文字列(1行)」フィールドか「リンク」フィールド(入力種別＝メールアドレス)より選択してください。',
    'content_type_label': 'メール本文の種別',
    'content_type_multipart_label': 'マルチパートメール (テキスト+HTML)',
    'content_type_plain_label': 'テキストメール',
    'template_sub_title_label': 'テンプレート設定',
    'template_generation_label': 'テンプレートの種類',
    'template_container_label': 'デフォルトテンプレート',
    'optional_sub_title_label': 'オプション設定',
    'sub_sub_title_label': '置換設定',
    'dtd_title_label': 'Dynamic Template Data設定',
    'key': 'キー',
    'value': '値',
    'save_btn': '保存',
    'cancel_btn': 'キャンセル',
    'sub_tag_variable_error': 'Substitution tagには半角英数のみ使用可能です',
    'dtd_variable_error': 'Dynamic Template Dataのキーには半角英数（{}.を除く）のみ使用可能です',
    'sendgrid_apikey_alert': 'APIキーの確認に失敗しました。 ',
    'template_select_alert': 'テンプレートの取得に失敗しました。 ',
    'sendgrid_apikey_required': 'APIキーは必須です',
    'from_required': 'Fromは必須です',
    'to_required': 'Toフィールドは必須です',
    'template_required': 'メールテンプレートは必須です',
    'template_generation_required': 'テンプレート種別の選択は必須です',
    'kintone_field': 'kintoneのフィールド'
  },
  'default': {
    'title_label': 'SendGrid Plug-in Settings',
    'general_settings_label': 'General Settings',
    'spot_send_settings_label': 'Send Settings',
    'auth_sub_title_label': 'Authentication settings',
    'auth_container_label': 'API key',
    'auth_help_label': 'Enter the API key provided by SendGrid. ',
    'auth_link': 'https://sendgrid.com/docs/User_Guide/Settings/api_keys.html',
    'auth_link_label': 'API Key Documentation',
    'auth_permission_label': 'Required permissions',
    'email_sub_title_label': 'Email settings',
    'email_from_name_container_label': 'From name',
    'email_to_help_label': 'Select the [Text(single-line)] or the [Link(Type is E-mail address)] field.',
    "email_to_name_container_label": 'To name',
    'email_to_name_help_label': 'Select the [Text(single-line)] or the [Link(Type is E-mail address)] field.',
    'content_type_label': 'Content type',
    'content_type_multipart_label': 'Multipart mail (Plain text + HTML)',
    'content_type_plain_label': 'Plain text mail',
    'template_sub_title_label': 'Template settings',
    'template_generation_label': 'Template type',
    'template_container_label': 'Default Template',
    'optional_sub_title_label': 'Optional settings',
    'sub_sub_title_label': 'Substitution settings',
    'dtd_title_label': 'Dynamic Template Data',
    'key': 'Key',
    'value': 'Value',
    'save_btn': '     Save     ',
    'cancel_btn': '     Cancel   ',
    'sub_tag_variable_error': 'Substitution tag must be single byte characters',
    'dtd_variable_error': 'Dynamic Template Data key must be single byte characters (except {}.)',
    'sendgrid_apikey_alert': 'API validate failed. ',
    'template_select_alert': 'Getting templates failed. ',
    'sendgrid_apikey_required': 'API key is required',
    'from_required': 'From is required',
    'to_required': 'To field is required',
    'template_required': 'Mail Template is required',
    'template_generation_required': 'Template type is required',
    'kintone_field': 'kintone Field'
  }
};

// Regular expression for substitution tags
var EXP_SUB_TAG = /^[a-zA-Z0-9!-/:-@¥[-`¥{-~]+$/;
// Regular expression for dynamic template data keys
var EXP_DTD = /^[a-zA-Z0-9!--/:-@¥[-`|~]+$/;

(function($, PLUGIN_ID) {
  'use strict';
  // Config key
  var config = kintone.plugin.app.getConfig(PLUGIN_ID);
  // User Information
  var userInfo = kintone.getLoginUser();
  // appId
  var appId = kintone.app.getId();
  //
  var lang = userInfo.language;

  // Event : Ready
  $(document).ready(function() {
    // Translate UI
    translateUI(lang);

    // Show config data
    showConfigData(config);

    // Event : Click Tab
    $('.tab>li').on('click', function() {
      var clicked = $(this).index();
      $(this).parent().children().each(function(index, element) {
        if (index == clicked) $(element).addClass('active');
        else $(element).removeClass('active');
      });
      $('.tab-content').children().each(function(index, element) {
        if (index == clicked) $(element).addClass('active');
        else $(element).removeClass('active');
      });
    });

    // Event : Select Template Generation
    $('input[name="template_generation"]:radio').on('change', function() {
      var templateGeneration = $('input[name=template_generation]:checked').val();
      refreshTemplatesSpace(templateGeneration);
      // Refresh optional settings
      refreshOptionalSettings(templateGeneration);
    });

    // Event : Refresh templates
    $('#refresh-templates').on('click', function() {
      var templateGeneration = $('input[name=template_generation]:checked').val();
      refreshTemplatesSpace(templateGeneration);
      return false;
    });

    // Event : Select tempaltes function.
    $('#template_select').change(function() {
      // Get version
      getVersion($('#template_select').val());
    });

    // Event : Select add substitution button.
    $('#add-sub').on('click', function() {
      kintone.api(kintone.api.url('/k/v1/form',true), 'GET', {app: appId}, function(resp) {
        addSub('', '', resp);
      });
    });

    // Event : Select add dynamic template data button
    $('#add-dtd').on('click', function() {
      kintone.api(kintone.api.url('/k/v1/form', true), 'GET', {app: appId}, function(resp) {
        addDtd('', '', resp);
      });
    });

    // Event : Click Save Button
    $('#submit').on('click', function() {
      // Required field check
      if (!$('#sendgrid_apikey').val()) {
        swal('Error', getStrings(lang, 'sendgrid_apikey_required'), 'error');
        return;
      }
      if (!$('#from').val()) {
        swal('Error', getStrings(lang, 'from_required'), 'error');
        return;
      }
      if (!$('#to_select').val()) {
        swal('Error', getStrings(lang, 'to_required'), 'error');
        return;
      }
      if (!$('#template_select').val()) {
        swal('Error', getStrings(lang, 'template_required'), 'error');
        return;
      }
      if (!$('input[name=template_generation]:checked').val()) {
        swal('Error', getStrings(lang, 'template_generation_required'), 'error');
        return;
      }
      // Validate API key
      var apiKeyAlert = $('#sendgrid_apikey_alert');
      validateApiKey()
        .then(function() {
          apiKeyAlert.empty().hide();
          // Save app config
          var saveConfig = {};
          saveConfig.from = $('#from').val();
          saveConfig.fromName = $('#from_name').val();
          saveConfig.contentType = $('input[name=content_type]:checked').val();
          saveConfig.templateGeneration = $('input[name=template_generation]:checked').val();
          saveConfig.templateName = $('#template_select').children(':selected').text();
          saveConfig.templateId = $('#template_select').val();
          saveConfig.emailFieldCode = $('#to_select').val();
          saveConfig.toNameFieldCode = $('#to_name_select').val();
          // substitution tags
          if (saveConfig.subNumber === undefined) {
            saveConfig.subNumber = 0;
          }
          for (var i = 0; i < saveConfig.subNumber; i++) {
            delete saveConfig['val' + i];
            delete saveConfig['code' + i];
          }
          var subContainer = $('#sub_container');
          var subNumber = 0;
          var subRows = subContainer.children('.sub-row');
          for (var q = 0; q < subRows.length; q++) {
            var subRow = subRows.eq(q);
            var subKey = subRow.find('.sub-key').val();
            var subVal = subRow.find('.sub-val').val();
            if (subKey.match(EXP_SUB_TAG) === null) {
              swal('Error', getStrings(lang, 'sub_tag_variable_error'), 'error');
              return;
            }
            saveConfig['val' + subNumber] = subKey;
            saveConfig['code' + subNumber] = subVal;
            subNumber++;
          }
          saveConfig.subNumber = String(subNumber);
          // dynamic template data
          if (saveConfig.dtdNumber === undefined) {
            saveConfig.dtdNumber = 0;
          }
          for (var i = 0; i < saveConfig.dtdNumber; i++) {
            delete saveConfig['dtd_key_' + i];
            delete saveConfig['dtd_val_' + i];
          }
          var dtdContainer = $('#dtd_container');
          var dtdNumber = 0;
          var dtdRows = dtdContainer.children('.dtd-row');
          for (var q = 0; q < dtdRows.length; q++) {
            var dtdRow = dtdRows.eq(q);
            var dtdKey = dtdRow.find('.dtd-key').val();
            var dtdVal = dtdRow.find('.dtd-val').val();
            if (dtdKey.match(EXP_DTD) === null) {
              swal('Error', getStrings(lang, 'dtd_variable_error'), 'error');
              return;
            }
            saveConfig['dtd_key_' + dtdNumber] = dtdKey;
            saveConfig['dtd_val_' + dtdNumber] = dtdVal;
            dtdNumber++;
          }
          saveConfig.dtdNumber = String(dtdNumber);
          //console.log(saveConfig);
          // Save proxy config
          var headers = getHeaders();
          kintone.plugin.app.setConfig(saveConfig, function(){
            kintone.plugin.app.setProxyConfig(
              'https://api.sendgrid.com/', 'POST', headers, {}, function() {
                kintone.plugin.app.setProxyConfig(
                  'https://api.sendgrid.com/', 'GET', headers, {}
                );
              }
            );
          });
        })
        .catch(function(reason) {
          apiKeyAlert.empty().hide();
          var text = getStrings(lang, 'sendgrid_apikey_alert');
          swal('Error', text + reason, 'error');
          $('#sendgrid_apikey_alert')
            .append($('<p />', {text: text + reason}))
            .show();
        });
    });

    // Event : Click Cancel Button
    $('#cancel').on('click', function() {
      history.back();
    });
  });

  // Event : Click clear subRow
  $(document).on('click', '.clear-sub-row', function() {
    $(this).closest('.sub-row').remove();
    return false;
  })

  // Event : Click clear dtdRow
  $(document).on('click', '.clear-dtd-row', function() {
    $(this).closest('.dtd-row').remove();
    return false;
  });

  function translateUI(lang) {
    $('#title_label').text(getStrings(lang, 'title_label'));
    $('#general_settings_label').text(getStrings(lang, 'general_settings_label'));
    $('#spot_send_settings_label').text(getStrings(lang, 'spot_send_settings_label'));
    $('#auth_sub_title_label').text(getStrings(lang, 'auth_sub_title_label'));
    $('#auth_container_label').text(getStrings(lang, 'auth_container_label'));
    $('#auth_help_label').text(getStrings(lang, 'auth_help_label'));
    $('#auth_link_label').text(getStrings(lang, 'auth_link_label'));
    $('#auth_link').attr('href', getStrings(lang, 'auth_link'));
    $('#auth_permission_label').text(getStrings(lang, 'auth_permission_label'));
    $('#email_sub_title_label').text(getStrings(lang, 'email_sub_title_label'));
    $('#email_from_name_container_label').text(getStrings(lang, 'email_from_name_container_label'));
    $('#email_to_help_label').text(getStrings(lang, 'email_to_help_label'));
    $('#email_to_name_container_label').text(getStrings(lang, 'email_to_name_container_label'));
    $('#email_to_name_help_label').text(getStrings(lang, 'email_to_name_help_label'));
    $('#content_type_label').text(getStrings(lang, 'content_type_label'));
    $('#content_type_multipart_label').text(getStrings(lang, 'content_type_multipart_label'));
    $('#content_type_plain_label').text(getStrings(lang, 'content_type_plain_label'));
    $('#template_sub_title_label').text(getStrings(lang, 'template_sub_title_label'));
    $('#template_generation_label').text(getStrings(lang, 'template_generation_label'));
    $('#template_container_label').text(getStrings(lang, 'template_container_label'));
    $('#optional_sub_title_label').text(getStrings(lang, 'optional_sub_title_label'));
    $('#sub_sub_title_label').text(getStrings(lang, 'sub_sub_title_label'));
    $('#dtd_title_label').text(getStrings(lang, 'dtd_title_label'));
    $('#save_btn').text(getStrings(lang, 'save_btn'));
    $('#cancel_btn').text(getStrings(lang, 'cancel_btn'));
  }

  function showConfigData(config) {
    // API key
    var cg = kintone.plugin.app.getProxyConfig('https://api.sendgrid.com/', 'POST');
    if (cg !== null) {
      var apiKey = cg.headers.Authorization.match(/^Bearer\s(.*)$/);
      if (apiKey[1].length > 0) {
        $('#sendgrid_apikey').val(apiKey[1]);
      }
      validateApiKey()
        .then(function() {
          $('#sendgrid_apikey_alert').empty().hide();
        })
        .catch(function(reason) {
          var text = getStrings(lang, 'sendgrid_apikey_alert');
          $('#sendgrid_apikey_alert')
            .append($('<p />', {text: text + reason}))
            .show();
        });
    }
    // from
    $('#from').val(config.from);
    // from name
    $('#from_name').val(config.fromName);
    // Content type
    if (config.contentType !== 'text/plain') {
      $('#content_type_multipart').prop('checked', true);
    } else {
      $('#content_type_plain').prop('checked', true);
    }
    // Template generation
    var templateGeneration = config.templateGeneration;
    if (!config.templateGeneration) {
      templateGeneration = 'legacy';
    }
    if (templateGeneration === 'dynamic') {
      $('#template_generation_dynamic').prop('checked', true);
    } else {
      $('#template_generation_legacy').prop('checked', true);
    }
    // Template
    refreshTemplatesSpace(templateGeneration);
    // Refresh optional settings
    refreshOptionalSettings(templateGeneration);
    // Show kintone data
    showKintoneData();
  }

  function validateApiKey() {
    var url = 'https://api.sendgrid.com/v3/scopes';
    return kintone.proxy(url, 'GET', getHeaders(), {}).then(function(resp) {
      var response = JSON.parse(resp[0]);
      var status = resp[1];
      if (status !== 200) {
        return Promise.reject('Http error: ' + status + ', ' + JSON.stringify(response));
      }
      if (response.errors === undefined && response.scopes.length > 0) {
        if (($.inArray('mail.send', response.scopes) < 0) ||
            ($.inArray('templates.read', response.scopes) < 0)) {
          return Promise.reject('Lack of scopes: ' + JSON.stringify(response.scopes));
        }
        return Promise.resolve('success');
      }
      return Promise.reject('Unknown response: ' + status + ', ' + JSON.stringify(response));
    }, function(e) {
      return Promise.reject('Unknown error:: ' + JSON.stringify(e));
    });
  }

  function getHeaders() {
    var headers = {};
    headers.Authorization = 'Bearer ' + $('#sendgrid_apikey').val();
    headers['Content-Type'] = 'application/json';
    return headers;
  }

  function getTemplates(generation) {
    var url = 'https://api.sendgrid.com/v3/templates?generations=' + generation;
    return kintone.proxy(url, 'GET', getHeaders(), {}).then(function(resp) {
      var response = JSON.parse(resp[0]);
      var status = resp[1];
      if (status !== 200) {
        return Promise.reject('Http error: ' + status + ', ' + JSON.stringify(response));
      }
      if (response.errors === undefined && response.templates.length > 0) {
        return Promise.resolve(response.templates);
      }
      return Promise.reject('Unknown response: ' + status + ', ' + JSON.stringify(response));
    }, function(e) {
      return Promise.reject('Unknown error:: ' + JSON.stringify(e));
    });
  }

  function refreshTemplatesSpace(generation) {
    // Template Edit Link
    if (generation === 'legacy') {
      $('#template_edit_label').attr('href', 'https://sendgrid.com/templates');
    } else {
      $('#template_edit_label').attr('href', 'https://mc.sendgrid.com/dynamic-templates');
    }
    // Templates
    var templateSelect = $('#template_select');
    var alert = $('#template_select_alert');
    getTemplates(generation)
      .then(function(templates){
        alert.empty().hide();
        templateSelect.empty();
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
              templateSelect.append(option);
              break;
            }
          }
        }
        getVersion($('#template_select').val());
      })
      .catch(function(reason) {
        var text = getStrings(lang, 'template_select_alert');
        alert.empty();
        templateSelect.empty();
        $('#template_result_subject').empty();
        $('#template_result_text').empty();
        $('#template_result_iframe').prop('srcdoc', '');
        alert.append($('<p />', {text: text + reason})).show();
      });
  }

  function getVersion(templateId) {
    var url = 'https://api.sendgrid.com/v3/templates/' + templateId;
    kintone.proxy(url, 'GET', getHeaders(), {}, function(resp) {
      var response = JSON.parse(resp);
      for (var n = 0; n < response.versions.length; n++) {
        if (response.versions[n].active == 1) {
          $('#template_result_subject').text(response.versions[n].subject);
          $('#template_result_text').text(response.versions[n].plain_content);
          $('#template_result_iframe').prop('srcdoc', response.versions[n].html_content);
        }
      }
    });
  }

  // TODO 表示のスイッチ
  function refreshOptionalSettings(generation) {
    if (generation === 'legacy') {
      $('#substitution-settings').show();
      $('#dtd-settings').hide();
    } else {
      $('#substitution-settings').hide();
      $('#dtd-settings').show();
    }
  }

  function getKintoneFields() {
    return kintone.api(kintone.api.url('/k/v1/form',true), 'GET', {app: appId}).then(function(resp) {
      return resp;
    });
  }

  function showKintoneData() {
    return getKintoneFields().then(function(resp) {
      var toSelect = $('#to_select');
      var toNameSelect = $('#to_name_select');
      toNameSelect.append($('<option/>'));
      var knFields = resp.properties;

      for (var i = 0; i < knFields.length; i++) {
        if ((knFields[i].type === 'SINGLE_LINE_TEXT' ||
          (knFields[i].type === 'LINK' && knFields[i].protocol === 'MAIL')))
        {
          // To
          var opTo = $('<option/>');
          opTo.attr('value', knFields[i].code);
          if (config.emailFieldCode === knFields[i].code) {
            opTo.prop('selected', true);
          }
          opTo.text(
            knFields[i].label + '(' + knFields[i].code + ')'
          );
          toSelect.append(opTo);
          // To name
          var opToName = $('<option/>');
          opToName.attr('value', knFields[i].code);
          if (config.toNameFieldCode === knFields[i].code) {
            opToName.prop('selected', true);
          }
          opToName.text(
            knFields[i].label + '(' + knFields[i].code + ')'
          );
          toNameSelect.append(opToName);
        }
      }
      for (var k = 0; k < config.subNumber; k++) {
        addSub(config['val' + k], config['code' + k], resp);
      }
      for (var k = 0; k < config.dtdNumber; k++) {
        addDtd(config['dtd_key_' + k], config['dtd_val_' + k], resp);
      }
    });
  }

  function addSub(default_val, default_code, resp) {
    var subContainer = $('#sub_container');
    var idx = 0;
    if (subContainer !== undefined && subContainer.children().length > 0) {
      idx = subContainer.children().length;
    }
    var subRow = $('<div/>').addClass('child-block').addClass('sub-row');
    // Left block
    var leftBlock = $('<div/>').addClass('left-block');
    var tagLabel = $('<div/>').append(
      $('<label/>').text('Substitution Tag')
    );
    var tagInput =
      $('<div/>')
      .addClass('kintoneplugin-input-outer')
      .append(
        $('<input />')
        .addClass('kintoneplugin-input-text')
        .addClass('sub-key')
        .attr('id', 'sub_tag_variable_' + idx)
        .val(default_val)
      );
    leftBlock.append(tagLabel).append(tagInput);
    subRow.append(leftBlock);
    // Right block
    var rightBlock = $('<div/>');
    var valLabel = $('<div/>').append(
      $('<label/>').text(getStrings(lang, 'kintone_field'))
    );
    var valInput =
      $('<div/>')
      .addClass('kintoneplugin-select-outer')
      .attr('id', 'code-outer' + idx);
    var valDiv = $('<div/>').addClass('kintoneplugin-select');
    var valSelect = $('<select/>').addClass('sub-val').attr('id', 'field_select' + idx);
    valSelect.append($('<option/>'));
    for (var i = 0; i < resp.properties.length; i++) {
      var code = resp.properties[i].code;
      var label = resp.properties[i].label;
      if (resp.properties[i].type === 'SINGLE_LINE_TEXT' ||
        (resp.properties[i].type === 'LINK' &&
        resp.properties[i].protocol === 'MAIL'))
      {
        var valOption = $('<option/>');
        valOption.attr('value', code);
        if (default_code == code) {
          valOption.prop('selected', true);
        }
        valOption.text(label + '(' + code + ')');
        valSelect.append(valOption);
      }
    }
    // Clear block
    var clearBlock = $('<div/>').addClass('child-vertical-center')
      .append(
        $('<a/>').addClass('clear-sub-row').addClass('link-button').prop('href', '#')
          .append($('<i/>').addClass('material-icons').text('clear'))
      );
    valDiv.append(valSelect);
    valInput.append(valDiv);
    rightBlock.append(valLabel).append(valInput);
    subRow.append(rightBlock);
    subRow.append(clearBlock);
    subContainer.append(subRow);
  }

  function addDtd(default_val, default_code, resp) {
    var dtdContainer = $('#dtd_container');
    var idx = 0;
    if (dtdContainer !== undefined && dtdContainer.children().length > 0) {
      idx = dtdContainer.children().length;
    }
    var dtdRow = $('<div/>').addClass('child-block').addClass('dtd-row');
    // Left block
    var leftBlock = $('<div/>').addClass('left-block');
    var keyLabel = $('<div/>').append(
      $('<label/>').text(getStrings(lang, 'key'))
    );
    var keyInput =
      $('<div/>')
      .addClass('kintoneplugin-input-outer')
      .append(
        $('<input />')
        .addClass('kintoneplugin-input-text')
        .addClass('dtd-key')
        .attr('id', 'dtd_variable_' + idx)
        .val(default_val)
      );
    leftBlock.append(keyLabel).append(keyInput);
    dtdRow.append(leftBlock);
    // Right block
    var rightBlock = $('<div/>');
    var valLabel = $('<div/>').append(
      $('<label/>').text(getStrings(lang, 'value'))
    );
    var valInput =
      $('<div/>')
      .addClass('kintoneplugin-select-outer')
      .attr('id', 'code-outer' + idx);
    var valDiv = $('<div/>').addClass('kintoneplugin-select');
    var valSelect = $('<select/>').addClass('dtd-val').attr('id', 'dtd_field_select' + idx);
    valSelect.append($('<option/>'));
    for (var i = 0; i < resp.properties.length; i++) {
      var code = resp.properties[i].code;
      var label = resp.properties[i].label;
      if (resp.properties[i].type === 'SINGLE_LINE_TEXT' ||
        (resp.properties[i].type === 'LINK' &&
        resp.properties[i].protocol === 'MAIL'))
      {
        var valOption = $('<option/>');
        valOption.attr('value', code);
        if (default_code == code) {
          valOption.prop('selected', true);
        }
        valOption.text(label + '(' + code + ')');
        valSelect.append(valOption);
      }
    }
    // Clear block
    var clearBlock = $('<div/>').addClass('child-vertical-center')
      .append(
        $('<a/>').addClass('clear-dtd-row').addClass('link-button').prop('href', '#')
          .append($('<i/>').addClass('material-icons').text('clear')
        )
      );
    valDiv.append(valSelect);
    valInput.append(valDiv);
    rightBlock.append(valLabel).append(valInput);
    dtdRow.append(rightBlock);
    dtdRow.append(clearBlock);
    dtdContainer.append(dtdRow);
  }

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
