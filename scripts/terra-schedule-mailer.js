'use strict';

$(function () {

  var mailtoAttendance = function mailtoAttendance() {
    var toNames = [].map.call(document.querySelector('.pluralitem').querySelectorAll('.actionmenu-btn'), function (n) {
      return n.textContent;
    });
    var titleText = document.getElementById('title').textContent;
    var scheduleUrlGuide = document.querySelector('.docfooter-uri').textContent;
    if (titleText && scheduleUrlGuide) {
      var closeWindow = window.open('mailto:' + encodeURIComponent(toNames.join('; ')) + '?subject=' + encodeURIComponent(titleText) + '&body=' + encodeURIComponent(scheduleUrlGuide));
	  closeWindow.document.title='新規メールが表示されたら閉じてOK！';
	  setTimeout(()=>{
		closeWindow.document.location='javascript:window.close()';
		}, 1000);
    }
  };

  var prependTriggerButton = function prependTriggerButton($base) {

    if ($base.find('.docfooter-app-uri a').text() == 'スケジュール' && $('#__mailto_attendance_icon').length == 0) {
      var trigger = $('<a>').addClass('noborder-button').attr({ id: '__mailto_attendance_icon', href: 'javascript:void(0)', title: '出席者全員にメール' });
      trigger.click(function () {
        return mailtoAttendance();
      });
　　    var icon =
   　　   $('<span>')
      　　  .addClass('icon')
      　　  .addClass('ico-create')
    　　    .addClass('__mailto_attendance_icon')
       　　 .text('出席者全員にメール');
	　　trigger.prepend(icon);
      $base.find('.buttons-wrap').append(trigger);
    }
  };

  // スケジュール画面
  // レポート機能と出欠登録機能が使えなくなる(タイミングの問題？詳しい原因不明)
  // を回避するために MutationObserver を使ってタイミングをずらす
  var wrapperQuery = '#wrapper';
  new MutationObserver(function () {
    prependTriggerButton($(wrapperQuery));
  }).observe(document.querySelector(wrapperQuery), { childList: true, subtree: true });

  // スケジュールポップアップ
  new MutationObserver(function () {
    var modalQuery = '.modal-dialog-content';
    var modal = document.querySelector(modalQuery);
    if (modal) {
      new MutationObserver(function () {
        // レポート機能と出欠登録機能が使えなくなる(タイミングの問題？詳しい原因不明)
        // を回避するために setTimeout を使ってタイミングをずらす
        setTimeout(function () {
          return prependTriggerButton($(modalQuery));
        }, 0);
      }).observe(modal, { childList: true });
    }
  }).observe(document.querySelector('#popup_field'), { childList: true });
});