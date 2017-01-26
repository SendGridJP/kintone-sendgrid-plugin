jQuery.noConflict();

;(function(global, $, undefined) {
  'use strict';
  var SendGrid = {
    matchFieldType: function(knFieldType, sgFieldType) {
      var match = {
        'CHECK_BOX': [],
        'SUBTABLE': [],
        'DROP_DOWN': ['text'],
        'USER_SELECT': [],
        'RADIO_BUTTON': ['text'],
        'RICH_TEXT': ['text'],
        'LINK': ['text'],
        'RECORD_NUMBER': ['number'],
        'REFERENCE_TABLE': [],
        'CALC': ['number'],
        'MODIFIER': [],
        'UPDATED_TIME': ['date'],
        'CREATOR': [],
        'CREATED_TIME': ['date'],
        'TIME': ['text'],
        'NUMBER': ['number'],
        'FILE': [],
        'DATETIME': ['date'],
        'DATE': ['date'],
        'MULTI_SELECT': [],
        'SINGLE_LINE_TEXT': ['text'],
        'MULTI_LINE_TEXT': ['text']
      };
      var ret = (knFieldType in match && jQuery.inArray(sgFieldType, match[knFieldType]) >= 0);
      // console.log('matchFieldType: ' + knFieldType + ', ' + sgFieldType + ', ret: ' + ret);
      return ret;
    }
  };
  global.SendGrid = SendGrid;
}(this.self || global));
