'use strict';

$(function () {

  var mailtoAttendance = function mailtoAttendance() {
	if(!document.querySelector('.pluralitem') || !document.querySelector('.schedule-doc-presence-attendee')) {return;}
	var myName;
	if(document.getElementById('selectOnlineStatusToolButton')) {
	  myName = document.querySelector('.aquabar-items span.ico-non').textContent;
	}
	var toNames = [];
	var ccNames = [];
	var roomNames = [];
	document.querySelectorAll('.selectlistline>.schedule-doc-presence-attendee').forEach(function(n){
		var rowIdentifer = n.previousElementSibling.textContent;
		if(n.textContent == myName) {return;}
		if(rowIdentifer == '承認') {
			roomNames.push(n.textContent.replace(/\[.*\]/,''));
		} else if(rowIdentifer == '出席') {
			toNames.push(n.textContent.replace(/ /,'　'));
		} else {
			ccNames.push(n.textContent.replace(/ /,'　'));
		}
	});
	var dtContent = document.getElementById('dtstart_view') ? document.getElementById('dtstart_view').textContent : document.getElementById('target_day_view').textContent;
    var titleText = document.getElementById('title').textContent;
    var scheduleUrlGuide = document.querySelector('.docfooter-uri').textContent;
    if (titleText && scheduleUrlGuide) {
		var mailtoHref = 'mailto:'+encodeURIComponent(toNames.join('; '))
			+'?subject='+encodeURIComponent(titleText + '['+dtContent.trim().split('年')[1]+']')
			+((roomNames.length>0)?'＠':'')+encodeURIComponent(roomNames.join(', '))
			+'&body='+encodeURIComponent(scheduleUrlGuide);
		if(ccNames.length > 0) {
			mailtoHref = mailtoHref+'&cc='+encodeURIComponent(ccNames.join('; '));
		}
		var linkNode = document.createElement('a');
		linkNode.href=mailtoHref;
		linkNode.textContent='send email to all';
		document.querySelector('.buttons-wrap').appendChild(linkNode).click();
		linkNode.remove();
    }
	return false;
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