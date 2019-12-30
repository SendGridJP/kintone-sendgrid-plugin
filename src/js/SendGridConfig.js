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
    'email_from_help_label': 'メールの送信元アドレス（from）を入力してください。',
    'email_from_name_container_label': 'From表示名',
    'email_from_name_help_label': 'From表示名を入力してください。',
    'email_to_container_label': 'Toフィールド',
    'email_to_help_label': '「文字列(1行)」フィールドか「リンク」フィールド(入力種別＝メールアドレス)より選択してください。',
    'content_type_label': '送信するメール本文のタイプ',
    'content_type_multipart_label': 'マルチパートメール (テキスト+HTML)',
    'content_type_plain_label': 'テキストメール',
    'template_sub_title_label': 'テンプレート設定',
    'template_get_btn': 'テンプレートの取得',
    'template_container_label': 'デフォルトテンプレート',
    'template_help_label': 'メールテンプレートを下のボタンから取得後、選択してください。',
    'template_edit_label': 'テンプレートを編集',
    'optional_sub_title_label': 'オプション設定',
    'sub_sub_title_label': '置換設定',
    'sub_add_btn': 'Substitution Tagの追加',
    'save_btn': '保存',
    'cancel_btn': 'キャンセル',
    'sub_tag_variable_error': 'Substitution tagには半角英数のみ使用可能です',
    'sendgrid_apikey_alert': 'APIキーの確認に失敗しました。 ',
    'template_select_alert': 'テンプレートの取得に失敗しました。 ',
    'sendgrid_apikey_required': 'APIキーは必須です',
    'from_required': 'Fromは必須です',
    'to_required': 'Toフィールドは必須です',
    'template_required': 'メールテンプレートは必須です',
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
    'email_from_help_label': 'Enter from email address. ',
    'email_from_name_container_label': 'From name',
    'email_from_name_help_label': 'Enter from email name. ',
    'email_to_container_label': 'To field',
    'email_to_help_label': 'Select the [Text(single-line)] or the [Link(Type is E-mail address)] field.',
    'content_type_label': 'Content type',
    'content_type_multipart_label': 'Multipart mail (Plain text + HTML)',
    'content_type_plain_label': 'Plain text mail',
    'template_sub_title_label': 'Template settings',
    'template_get_btn': 'Get a list of Templates',
    'template_container_label': 'Default Template',
    'template_help_label': 'Get a list of all the templates and select a template.',
    'template_edit_label': 'Edit Template',
    'optional_sub_title_label': 'Optional settings',
    'sub_sub_title_label': 'Substitution settings',
    'sub_add_btn': 'Add substitution tag',
    'save_btn': '     Save     ',
    'cancel_btn': '     Cancel   ',
    'sub_tag_variable_error': 'Substitution tag must be single byte characters',
    'sendgrid_apikey_alert': 'API validate failed. ',
    'template_select_alert': 'Getting templates failed. ',
    'sendgrid_apikey_required': 'API key is required',
    'from_required': 'From is required',
    'to_required': 'To field is required',
    'template_required': 'Mail Template is required',
    'kintone_field': 'kintone Field'
  }
};

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
    $('#email_from_help_label').text(getStrings(lang, 'email_from_help_label'));
    $('#email_from_name_container_label').text(getStrings(lang, 'email_from_name_container_label'));
    $('#email_from_name_help_label').text(getStrings(lang, 'email_from_name_help_label'));
    $('#email_to_container_label').text(getStrings(lang, 'email_to_container_label'));
    $('#email_to_help_label').text(getStrings(lang, 'email_to_help_label'));
    $('#content_type_label').text(getStrings(lang, 'content_type_label'));
    $('#content_type_multipart_label').text(getStrings(lang, 'content_type_multipart_label'));
    $('#content_type_plain_label').text(getStrings(lang, 'content_type_plain_label'));
    $('#template_sub_title_label').text(getStrings(lang, 'template_sub_title_label'));
    $('#template_get_btn').text(getStrings(lang, 'template_get_btn'));
    $('#template_container_label').text(getStrings(lang, 'template_container_label'));
    $('#template_help_label').text(getStrings(lang, 'template_help_label'));
    $('#template_edit_label').text(getStrings(lang, 'template_edit_label'));
    $('#optional_sub_title_label').text(getStrings(lang, 'optional_sub_title_label'));
    $('#sub_sub_title_label').text(getStrings(lang, 'sub_sub_title_label'));
    $('#sub_add_btn').text(getStrings(lang, 'sub_add_btn'));
    $('#save_btn').text(getStrings(lang, 'save_btn'));
    $('#cancel_btn').text(getStrings(lang, 'cancel_btn'));

    // Display saved data
    if (Object.keys(config).length > 0) {
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

      // Template
      refreshTemplatesSpace();
      // Show kintone data
      showKintoneData();
    } else {
      // First settings
      // Show kintone data
      showKintoneData();
    }

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

    // Event : Click Get templates button
    $('#get-template').on('click', function() {
      refreshTemplatesSpace();
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
      if (!$('#email_select').val()) {
        swal('Error', getStrings(lang, 'to_required'), 'error');
        return;
      }
      if (!$('#template_select').val()) {
        swal('Error', getStrings(lang, 'template_required'), 'error');
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
          saveConfig.templateName = $('#template_select').children(':selected').text();
          saveConfig.templateId = $('#template_select').val();
          saveConfig.emailFieldCode = $('#email_select').val();
          if (saveConfig.subNumber === undefined) {
            saveConfig.subNumber = 0;
          }
          for (var i = 0; i < saveConfig.subNumber; i++) {
            delete saveConfig['val' + i];
            delete saveConfig['code' + i];
          }
          var subContainer = $('#sub_container');
          var subNumber = 0;
          for (var q = 0; q < subContainer.children().length; q++) {
            if ($('#sub_tag_variable_' + q).val() !== '' && $('#field_select' + q).val() !== '') {
              if ($('#sub_tag_variable_' + q).val().match(/^[a-zA-Z0-9!-/:-@¥[-`¥{-~]+$/) === null) {
                swal('Error', getStrings(lang, 'sub_tag_variable_error'), 'error');
                return;
              }
              saveConfig['val' + subNumber] = $('#sub_tag_variable_' + q).val();
              saveConfig['code' + subNumber] = $('#field_select' + q).val();
              subNumber++;
            }
          }
          saveConfig.subNumber = String(subNumber);
          console.log(saveConfig);
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

  function getTemplates() {
    var url = 'https://api.sendgrid.com/v3/templates';
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

  function refreshTemplatesSpace() {
    var templateSelect = $('#template_select');
    var alert = $('#template_select_alert');
    getTemplates()
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
        getVersion(config.templateId);
      })
      .catch(function(reason) {
        var text = getStrings(lang, 'template_select_alert');
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

  function getKintoneFields() {
    return kintone.api(kintone.api.url('/k/v1/form',true), 'GET', {app: appId}).then(function(resp) {
      return resp;
    });
  }

  function showKintoneData() {
    return getKintoneFields().then(function(resp) {
      var adArray = [];
      var labelArray = [];
      var selectSpace = $('#email_select');
      var knFields = resp.properties;

      for (var i = 0; i < knFields.length; i++) {
        if ((knFields[i].type === 'SINGLE_LINE_TEXT' ||
          (knFields[i].type === 'LINK' && knFields[i].protocol === 'MAIL')))
        {
          var op = $('<option/>');
          op.attr('value', knFields[i].code);
          if (config.emailFieldCode === knFields[i].code) {
            op.prop('selected', true);
          }
          op.text(
            knFields[i].label + '(' + knFields[i].code + ')'
          );
          selectSpace.append(op);
        }
        if (knFields[i].type === 'SINGLE_LINE_TEXT') {
          adArray.push(knFields[i].code);
          labelArray.push(knFields[i].label);
        }
      }
      for (var k = 0; k < config.subNumber; k++) {
        addSub(config['val' + k], config['code' + k], resp);
      }
    });
  }

  function addSub(default_val, default_code, resp) {
    var subContainer = $('#sub_container');
    var idx = 0;
    if (subContainer !== undefined && subContainer.children().length > 0) {
      idx = subContainer.children().length;
    }
    var subRow = $('<div/>').addClass('childBlock');
    var leftBlock = $('<div/>').addClass('leftblock').attr('style', 'float:left;');
    var tagLabel = $('<label/>').addClass('kintoneplugin-label').text('Substitution Tag');
    var tagInput =
      $('<div/>')
      .addClass('kintoneplugin-input-outer')
      .append(
        $('<input />')
        .addClass('kintoneplugin-input-text')
        .attr('id', 'sub_tag_variable_' + idx)
        .val(default_val)
      );
    leftBlock.append(tagLabel).append($('<br>')).append(tagInput);
    subRow.append(leftBlock);

    var rightBlock = $('<div/>').addClass('rightblock');
    var valLabel = $('<label/>').addClass('kintoneplugin-label');
    valLabel = getStrings(lang, 'kintone_field');
    var valInput =
      $('<div/>')
      .addClass('kintoneplugin-select-outer')
      .attr('id', 'code-outer' + idx);
    var valDiv = $('<div/>').addClass('kintoneplugin-select');
    var valSelect = $('<select/>').attr('id', 'field_select' + idx);
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
    valDiv.append(valSelect);
    valInput.append(valDiv);
    rightBlock.append(valLabel).append($('<br>')).append(valInput);
    subRow.append(rightBlock);
    subContainer.append(subRow);
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
