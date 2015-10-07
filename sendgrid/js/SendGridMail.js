(function(PLUGIN_ID) {
    'use strict';
    //Config key
    var config = kintone.plugin.app.getConfig(PLUGIN_ID);
    //User Information
    var userInfo = kintone.getLoginUser();
    //Send mail function
    function sendMail(smtpapi) {
        var url = 'https://api.sendgrid.com/api/mail.send.json';
        var method = 'POST';
        var headers = {};
        headers.Authorization = 'Bearer ' + config.sendgridApiKey;
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        var data =
          'to=' + encodeURIComponent(config.from) +
          '&from=' + encodeURIComponent(config.from) +
          '&subject=' + '　' + // replace <% subject %> in template
          '&text=' + '　' +    // replace <% text %> in template
          '&html=' + '<div></div>'      // replace <% text %> in template
        ;
        data = data + '&x-smtpapi=' + JSON.stringify(smtpapi);
        var callback = function(resp, status, obj) {
            if (status === 200) {
                if (userInfo.language === 'ja') {
                    swal({title: 'Complete',
                          text: 'メールの送信リクエストに成功しました。',
                          html: true,
                          type: 'success'});
                }else {
                    swal({title: 'Complete',
                          text: 'A request for mail sending was success.',
                          html: true,
                          type: 'success'});
                }
            }else {
                if (userInfo.language === 'ja') {
                    swal(
                        'Failed',
                        'メールの送信リクエストに失敗しました。Status code:' + status,
                        'error'
                    );
                }else {
                    swal(
                        'Failed',
                        'A request for mail sending was failed. Status code:' + status,
                        'error'
                    );
                }
            }
        };
        var errback = function(e) {
            swal('Failed', 'Mail sending was failed.', 'error');
        };
        kintone.plugin.app.proxy(
            PLUGIN_ID, url, method, headers, data, callback, errback
        );
    }
    kintone.events.on('app.record.index.show', function(event) {
        if ($('#my_index_button').length > 0) {
            return;
        }
        // make label
        var templateLabel = document.createElement('span');
        if (userInfo.language === 'ja') {
            templateLabel.textContent = 'テンプレート：';
        } else {
            templateLabel.textContent = 'Template: ';
        }
        kintone.app.getHeaderMenuSpaceElement('buttonSpace').appendChild(templateLabel);

        // make template select
        var templateSpace = document.createElement('select');
        templateSpace.id = 'temp_select';
        templateSpace.className = 'select-cybozu';
        var url = 'https://api.sendgrid.com/v3/templates';
        var headers = {};
        headers.Authorization = 'Bearer ' + config.sendgridApiKey;
        kintone.proxy(url, 'GET', headers, {}, function(resp) {
            var responseTemp = JSON.parse(resp);
            if (responseTemp.templates.length > 0 && responseTemp.errors === undefined) {
                for (var m = 0; m < responseTemp.templates.length; m++) {
                    var template = responseTemp.templates[m];
                    for (var n = 0; n < template.versions.length; n++) {
                        var version = template.versions[n];
                        if (version.active === 1) {
                            var op3 = document.createElement('option');
                            op3.value = template.id;
                            op3.className = 'goog-inline-block goog-menu-button-inner-box';
                            op3.textContent = template.name;
                            if (config.templateId === template.id) {
                                op3.selected = true;
                            }
                            templateSpace.appendChild(op3);
                        }
                    }
                }
            }else {
                var op4 = document.createElement('option');
                op4.textContent = 'Couldn\'t get lists';
                templateSpace.appendChild(op4);
            }
        });
        kintone.app.getHeaderMenuSpaceElement().appendChild(templateSpace);

        //make buttonEl
        var records = event.records;
        var buttonEl = document.createElement('button');
        buttonEl.textContent = 'Mail Send';
        buttonEl.id = 'my_index_button';
        buttonEl.addEventListener('click', function() {
            var swalContent = '';
            if (userInfo.language === 'ja') {
                swalContent = {
                    title: 'メールを送信しますか？',
                    type: 'warning',
                    showCancelButton: true,
                    cancelButtonText: 'キャンセル',
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: '送信',
                    closeOnConfirm: false
                };
            }else {
                swalContent = {
                    title: 'Are you sure?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: 'Send',
                    closeOnConfirm: false
                };
            }
            swal(swalContent, function() {
                if (records.length === 0) {
                    if (userInfo.language === 'ja') {
                        swal('データがありません', '送信するリストが見つかりません.', 'warning');
                    }else {
                        swal('No input data', 'Input data was nothing.', 'warning');
                    }
                    return;
                }else {
                    // Smtpapi
                    var to = [];
                    var sub = {};
                    for (var j = 0; j < config.subNumber; j++) {
                        sub[config['val'+j]] = [];
                    }
                    for (var i = 0; i < records.length; i++) {
                        to.push(records[i][config.emailFieldCode].value);
                        for (var k = 0; k < config.subNumber; k++) {
                            sub[config['val'+k]].push(records[i][config['code'+k]].value);
                        }
                    }
                    var smtpapi = {};
                    smtpapi.to = to;
                    smtpapi.sub = sub;
                    smtpapi.filters = {};
                    smtpapi.filters.templates = {};
                    smtpapi.filters.templates.settings = {};
                    smtpapi.filters.templates.settings.enable = 1;
                    smtpapi.filters.templates.settings.template_id = $('#temp_select').val();
                    // SendMail
                    sendMail(smtpapi);
                }
            });
        }, false);
        kintone.app.getHeaderMenuSpaceElement('buttonSpace').appendChild(buttonEl);
    });
    kintone.events.on('app.record.index.edit.submit', function(event) {
        if (userInfo.language === 'ja') {
            swal('メールを送信する前に画面をリロードしてください', 'メールリストの反映にはリロードが必要です', 'warning');
        }else {
            swal('Before mail will be sending, reloading is required.', 'Reloading is required', 'warning');
        }
    });
})(kintone.$PLUGIN_ID);
