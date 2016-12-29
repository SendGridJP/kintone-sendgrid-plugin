(function(PLUGIN_ID) {
    'use strict';
    //Config key
    var config = kintone.plugin.app.getConfig(PLUGIN_ID);
    //User Information
    var userInfo = kintone.getLoginUser();
    //appId
    var appId = kintone.app.getId();
    //Send mail function
    function sendMail(smtpapi) {
        var url = 'https://api.sendgrid.com/api/mail.send.json';
        var method = 'POST';
        var headers = {};
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        var data =
          'to=' + encodeURIComponent(config.from) +
          '&from=' + encodeURIComponent(config.from) +
          '&subject=' + '　' + // replace <% subject %> in template
          '&text=' + '　' +    // replace <% text %> in template
          '&html=' + '<div></div>'      // replace <% text %> in template
        ;
        data = data + '&x-smtpapi=' + encodeURIComponent(JSON.stringify(smtpapi));
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
                        'メールの送信リクエストに失敗しました。Status code:' + status + '。Response:' + resp,
                        'error'
                    );
                }else {
                    swal(
                        'Failed',
                        'A request for mail sending was failed. Status code:' + status + '. Response:' + resp,
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
    function getSmtpapi(records, config) {
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
        return smtpapi;
    }
    function processRecords(appId, condition, limit, offset) {
        condition = condition + ' limit ' + limit + ' offset ' + offset;
        kintone.api(
            '/k/v1/records', 'GET',
            {app: appId, query: condition},
            function(resp){
                sendMail(getSmtpapi(resp.records, config));
            }
        );
    }
    kintone.events.on('app.record.index.show', function(event) {
        if ($('#my_index_button').length > 0) {
            return;
        }
        // make label
        var templateLabel = document.createElement('div');
        templateLabel.classList.add('header-menu-item');
        if (userInfo.language === 'ja') {
            templateLabel.textContent = 'テンプレート';
        } else {
            templateLabel.textContent = 'Template';
        }
        kintone.app.getHeaderMenuSpaceElement('buttonSpace').appendChild(templateLabel);

        // make template select
        var templateOuter = document.createElement('div');
        templateOuter.classList.add('kintoneplugin-select-outer');
        templateOuter.classList.add('header-menu-item');
        templateOuter.classList.add('header-menu-item-middle');
        var templateDiv = document.createElement('div');
        templateDiv.classList.add('kintoneplugin-select');
        var templateSpace = document.createElement('select');
        templateSpace.id = 'temp_select';
        var url = 'https://api.sendgrid.com/v3/templates';
        var headers = {};
        headers['Content-Type'] = 'application/json';
        kintone.plugin.app.proxy(
            PLUGIN_ID, url, 'GET', headers, {}, function(resp, status, obj) {
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
        templateDiv.appendChild(templateSpace);
        templateOuter.appendChild(templateDiv);
        kintone.app.getHeaderMenuSpaceElement().appendChild(templateOuter);

        //make buttonEl
        var records = event.records;
        var buttonEl = document.createElement('button');
        buttonEl.classList.add('header-menu-item');
        buttonEl.classList.add('kintoneplugin-button-normal');
        if (userInfo.language === 'ja') {
          buttonEl.textContent = 'メール送信';
        } else {
          buttonEl.textContent = 'Mail Send';
        }
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
                    closeOnConfirm: true
                };
            }else {
                swalContent = {
                    title: 'Are you sure?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: 'Send',
                    closeOnConfirm: true
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
                    var condition= kintone.app.getQueryCondition();
                    kintone.api(
                        '/k/v1/records', 'GET',
                        {app: appId, query: condition, totalCount: true},
                        function(resp){
                            var limit = 500;
                            var reqNums = Math.ceil(resp.totalCount / limit);
                            for (var i = 0; i < reqNums; i++) {
                                var offset = i * limit;
                                var condition= kintone.app.getQueryCondition();
                                processRecords(appId, condition, limit, offset);
                            }
                        }
                    );
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
