jQuery.noConflict();

(function($, PLUGIN_ID) {
    'use strict';
    var responseTemp = '';
    var initialFlag = true;
    var selectFlag = false;
    var valArray = [];
    var headers = {};

    var addSub = function(default_val, default_code, resp) {
        var subContainer = $('#sub_container');
        var idx = 0;
        if (subContainer !== undefined && subContainer.children().length > 0) {
            idx = subContainer.children().length;
        }
        var subRow = $('<div/>').addClass('childBlock');
        var leftBlock =
            $('<div/>').addClass('leftblock').attr('style', 'float:left;');
        var tagLabel =
            $('<label/>')
            .addClass('kintoneplugin-label')
            .text('Substitution Tag');
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
        var valLabel =
            $('<label/>')
            .addClass('kintoneplugin-label');
        var userInfo = kintone.getLoginUser();
        if (userInfo.language === 'ja') {
            valLabel.text('kintoneのフィールド');
        } else {
            valLabel.text('kintone Field');
        }
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
            if (resp.properties[i].type === 'SINGLE_LINE_TEXT') {
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
    };

    //get appId
    $(document).ready(function() {
        //Localization(Japanese)
        var userInfo = kintone.getLoginUser();
        if (userInfo.language === 'ja') {
            $('#title_label').text('SendGrid Plugin 設定画面');

            $('#auth_sub_title_label').text('認証設定');
            $('#auth_help_label').text('SendGrid のAPI keyを入力してください。詳細は');
            $('#auth_link').text('こちら');

            $('#email_sub_title_label').text('メール設定');
            $('#email_from_help_label').text('メールの送信元アドレス（from）を入力してください。');
            $('#email_to_container_label').text('Toフィールド');
            $('#email_to_help_label').text('文字列(1行)フィールドかEmailに設定したリンクフィールドより選択してください。');

            $('#template_sub_title_label').text('テンプレート設定');
            $('#template_get_btn').text('テンプレートの取得');
            $('#template_container_label').text('メールテンプレート名');
            $('#template_help_label').text('メールテンプレートを下のボタンから取得後、選択してください。');

            $('#sub_sub_title_label').text('置換設定(オプション)');
            $('#sub_add_btn').text('Substitution Tagの追加');

            $('#save_btn').text('保存');
            $('#cancel_btn').text('キャンセル');
        }
        //Set plugin-ID
        var conf = kintone.plugin.app.getConfig(PLUGIN_ID);
        var appId = kintone.app.getId();
        //Get existing data.
        if (Object.keys(conf).length > 0) {
            var cg = kintone.plugin.app.getProxyConfig(
                'https://api.sendgrid.com/', 'POST'
            );
            if (cg !== null) {
                var apiKey = cg.headers.Authorization.match(/^Bearer\s(.*)$/);
                if (apiKey[1].length > 0) {
                    $('#sendgrid_apikey').val(apiKey[1]);
                }
            }
            $('#from').val(conf.from);
            //Display the selected template.
            var opTag = $('<option/>');
            var templateSelect = $('#template_select');
            templateSelect.empty();
            opTag.attr('value', conf.templateId);
            opTag.text(conf.templateName);
            opTag.prop('selected', true);
            templateSelect.append(opTag);
            //Get codes in this template
            var getUrl = 'https://api.sendgrid.com/v3/templates/' + conf.templateId;
            headers.Authorization = 'Bearer ' + $('#sendgrid_apikey').val();
            kintone.proxy(getUrl, 'GET', headers, {}, function(resp) {
                resp = JSON.parse(resp);
                for (var n = 0; n < resp.versions.length; n++) {
                    if (resp.versions[n].active == 1) {
                        $('#template_result_text').text(resp.versions[n].plain_content);
                        $('#template_result_html').text(resp.versions[n].html_content);
                    }
                }
                opTag.attr('value', resp.id);
            });
            //Display existing data.
            kintone.api('/k/v1/form', 'GET', {app: appId}, function(resp) {
                var adArray = [];
                var labelArray = [];
                var selectSpace = $('#email_select');
                for (var i = 0; i < resp.properties.length; i++) {
                    if (resp.properties[i].type === 'SINGLE_LINE_TEXT' ||
                        (resp.properties[i].type === 'LINK' &&
                            resp.properties[i].protocol === 'MAIL'))
                    {
                        var op = $('<option/>');
                        op.attr('value', resp.properties[i].code);
                        if (conf.emailFieldCode === resp.properties[i].code) {
                            op.prop('selected', true);
                        }
                        op.text(resp.properties[i].label +
                            '(' + resp.properties[i].code + ')'
                        );
                        selectSpace.append(op);
                    }
                    if (resp.properties[i].type === 'SINGLE_LINE_TEXT') {
                        adArray.push(resp.properties[i].code);
                        labelArray.push(resp.properties[i].label);
                    }
                }
                for (var k = 0; k < conf.subNumber; k++) {
                    addSub(conf['val' + k], conf['code' + k], resp);
                }
            });
        }else {
            //When the first setting.
            kintone.api('/k/v1/form', 'GET', {app: appId}, function(resp) {
                var adArray = [];
                var labelArray = [];
                var selectSpace = $('#email_select');
                for (var i = 0; i < resp.properties.length; i++) {
                    if (resp.properties[i].type === 'SINGLE_LINE_TEXT' ||
                        (resp.properties[i].type === 'LINK' &&
                            resp.properties[i].protocol === 'MAIL'))
                    {
                        var op = $('<option/>');
                        op.attr('value', resp.properties[i].code);
                        op.text(resp.properties[i].label +
                              '(' + resp.properties[i].code + ')'
                        );
                        selectSpace.append(op);
                    }
                    if (resp.properties[i].type === 'SINGLE_LINE_TEXT') {
                        adArray.push(resp.properties[i].code);
                        labelArray.push(resp.properties[i].label);
                    }
                }
                for (var k = 0; k < conf.subNumber; k++) {
                    addSub(conf['code' + k], conf['val' + k], resp);
                }
            });
            initialFlag = false;
        }
        //Get templates button function.
        $('#get-template').on('click', function() {
            var url = 'https://api.sendgrid.com/v3/templates';
            headers.Authorization = 'Bearer ' + $('#sendgrid_apikey').val();
            kintone.proxy(url, 'GET', headers, {}, function(resp) {
                responseTemp = resp;
                responseTemp = JSON.parse(responseTemp);
                var templateSpace = $('#template_select');
                if (responseTemp.templates.length > 0 && responseTemp.errors === undefined) {
                    if (templateSpace[0].childNodes.length > 0) {
                        $('#template_select').empty();
                    }
                    for (var m = 0; m < responseTemp.templates.length; m++) {
                        var template = responseTemp.templates[m];
                        for (var n = 0; n < template.versions.length; n++) {
                            var version = template.versions[n];
                            if (version.active === 1) {
                                var op3 = $('<option/>');
                                op3.attr('value', responseTemp.templates[m].id);
                                op3.text(responseTemp.templates[m].name);
                                templateSpace.append(op3);
                                break;
                            }
                        }
                    }
                }else {
                    $('#template_select').empty();
                    var op4 = $('<option/>');
                    op4.text('Couldn\'t get lists');
                    templateSpace.append(op4);
                }
            });
            if (userInfo.language === 'ja') {
                $('#template_result_text').text('テンプレートを選択してください。');
                $('#template_result_html').text('テンプレートを選択してください。');
            }else {
                $('#template_result_text').text('Select the tmplate.');
                $('#template_result_html').text('Select the tmplate.');
            }
            initialFlag = false;
        });
        //Select tempaltes function.
        $('#template_select').change(function() {
            if (selectFlag === false) {
                //First click
                selectFlag = true;
                return;
            }else if (initialFlag === false) {
                //Get codes in this template
                var getUrl = 'https://api.sendgrid.com/v3/templates/' + $('#template_select').val();
                headers.Authorization = 'Bearer ' + $('#sendgrid_apikey').val();
                kintone.proxy(getUrl, 'GET', headers, {}, function(resp) {
                    resp = JSON.parse(resp);
                    for (var n = 0; n < resp.versions.length; n++) {
                        if (resp.versions[n].active == 1) {
                            $('#template_result_text').text(resp.versions[n].plain_content);
                            $('#template_result_html').text(resp.versions[n].html_content);
                        }
                    }
                });
            }else {
                return;
            }
        });
        //Select add substitution button.
        $('#add-sub').on('click', function() {
            kintone.api('/k/v1/form', 'GET', {app: appId}, function(resp) {
                addSub('', '', resp);
            });
        });
        //The save button function.
        $('#submit').on('click', function() {
            var config = {};
            config.from = $('#from').val();
            config.templateName = $('#template_select').children(':selected').text();
            config.templateId = $('#template_select').val();
            config.emailFieldCode = $('#email_select').val();
            //Required field check
            if (!$('#sendgrid_apikey').val() && (userInfo.language === 'ja')) {
                swal('Error', '必須項目 SendGrid API key が選択されていません。', 'error');
                return;
            } else if (!$('#sendgrid_apikey').val() && (userInfo.language === 'en')) {
                swal('Error', 'SendGrid API key is required.', 'error');
                return;
            }
            if (!$('#from').val() && (userInfo.language === 'ja')) {
                swal('Error', '必須項目 From が入力されていません。', 'error');
                return;
            } else if (!$('#from').val() && (userInfo.language === 'en')) {
                swal('Error', 'From is required.', 'error');
                return;
            }
            if (!$('#email_select').val() && (userInfo.language === 'ja')) {
                swal('Error', '必須項目 Toフィールドが選択されていません。', 'error');
                return;
            } else if (!$('#email_select').val()) {
                swal('Error', 'To field is required.', 'error');
                return;
            }
            if (!$('#template_select').val() && (userInfo.language === 'ja')) {
                swal('Error', '必須項目 メールテンプレート名 が選択されていません。', 'error');
                return;
            } else if (!$('#template_select').val()) {
                swal('Error', 'Mail Template is required.', 'error');
                return;
            }
            // Substitution tag
            if (config.subNumber === undefined) {
                config.subNumber = 0;
            }
            for (var i = 0; i < config.subNumber; i++) {
                delete config['val' + i];
                delete config['code' + i];
            }
            var subContainer = $('#sub_container');
            var subNumber = 0;
            for (var q = 0; q < subContainer.children().length; q++) {
                if ($('#sub_tag_variable_' + q).val() !== '' && $('#field_select' + q).val() !== '') {
                    if ($('#sub_tag_variable_' + q).val().match(/^[a-zA-Z0-9!-/:-@¥[-`¥{-~]+$/) === null) {
                        var subError = 'Substitution tag must be single byte characters';
                        if (userInfo.language === 'ja') {
                            subError = 'Substitution tagには半角英数のみ使用可能です。';
                        }
                        swal('Error', subError, 'error');
                        return;
                    }
                    config['val' + subNumber] = $('#sub_tag_variable_' + q).val();
                    config['code' + subNumber] = $('#field_select' + q).val();
                    subNumber++;
                }
            }
            config.subNumber = String(subNumber);
            headers.Authorization = 'Bearer ' + $('#sendgrid_apikey').val();
            kintone.plugin.app.setConfig(config, function(){
                kintone.plugin.app.setProxyConfig(
                    'https://api.sendgrid.com/', 'POST', headers, {}, function() {
                        kintone.plugin.app.setProxyConfig(
                            'https://api.sendgrid.com/', 'GET', headers, {}
                        );
                    }
                );
            });
        });
        //The cancel button function.
        $('#cancel').click(function() {
            history.back();
        });
    });
})(jQuery, kintone.$PLUGIN_ID);
