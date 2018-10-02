'use strict';

(function () {

  var mailtoAttendance = function() {
	if(!document.querySelector('.pluralitem') || !document.querySelector('.schedule-doc-presence-attendee')) {return;}
	var myName;
	if(document.getElementById('selectOnlineStatusToolButton')) {
	  myName = document.querySelector('.aquabar-items span.ico-non').textContent;
	}
	var toNames = [];
	var ccNames = [];
	var roomNames = [];
	[].forEach.call(document.querySelectorAll('.selectlistline>.schedule-doc-presence-attendee'),function(n){
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

  var downloadIcoFile = function() {
    if(!document.querySelector('.pluralitem') || !document.querySelector('.schedule-doc-presence-attendee')) {return;}
    var roomNames = [];
    [].forEach.call(document.querySelectorAll('.selectlistline>.schedule-doc-presence-attendee'),function(n){
      var rowIdentifer = n.previousElementSibling.textContent;
      if(rowIdentifer == '承認') {
        roomNames.push(n.textContent.replace(/\[.*\]/,''));
      }
    });
    var titleText = document.getElementById('title').textContent;
    var scheduleUrlGuide = document.querySelector('.docfooter-uri').textContent;
    if (titleText && scheduleUrlGuide) {
      var s = getCalender();

      var res = 'BEGIN:VCALENDAR\n';
      res += 'VERSION:2.0\n';
      res += 'PRODID:-//fs1.tis.co.jp/terra-ical//EN\n'
      res += 'BEGIN:VTIMEZONE\n';
      res += 'TZID:Asia/Tokyo\n';
      res += 'BEGIN:STANDARD\n';
      res += 'DTSTART:19390101T000000\n';
      res += 'TZOFFSETFROM:+0900\n';
      res += 'TZOFFSETTO:+0900\n';
      res += 'TZNAME:JST\n';
      res += 'END:STANDARD\n';
      res += 'END:VTIMEZONE\n';  
      res += 'BEGIN:VEVENT\n';
      res += 'SUMMARY:' + titleText + '\n';
      res += 'LOCATION:' + roomNames.join(",") + '\n';
      res += 'DESCRIPTION:Terra URL -> ' + scheduleUrlGuide + '\n';
      //res += 'UID:' + s.UID + '\n';
      res += 'DTSTART;TZID=Asia/Tokyo:' + s.DTSTART + '\n';
      res += 'DTEND;TZID=Asia/Tokyo:' + s.DTEND + '\n';
      res += 'END:VEVENT\n';
      res += 'END:VCALENDAR\n';
  
      var downLoadLink = document.createElement("a");
      downLoadLink.download = "calender.ics"; // fix
      downLoadLink.href = URL.createObjectURL(new Blob([res], {type: "text.calendar"}));
      downLoadLink.dataset.downloadurl = ["text/calendar", downLoadLink.download, downLoadLink.href].join(":");
      downLoadLink.click();
    }
    return false;
  };

  var getCalender = function () {
    var q = document.querySelector.bind(document);
    var textElem = q('#dtstart_view .aq-statictext') 
    ?  q('#dtstart_view .aq-statictext')    /*通常イベント*/
    :  q('#target_day_view .aq-statictext') /*繰り返しのイベント*/;
    var text = textElem.dataset.value;
    var date = null;
    // Dateクラスの月インデックス（0始まり）として扱う
    /* 月インデックス（0始まり）を月番号（1始まり）に */
    var monthIndex = function(monthNumber) {
      return monthNumber - 1;
    };
    /* 月番号（1始まり）を月インデックス（0始まり）に */
    var monthNumber = function(monthIndex) {
      return monthIndex + 1;
    };
    if (text.match(/^(\d+)年(\d+)月(\d+)日\(.\) (\d+):(\d+) ～ (\d+):(\d+)$/)) /*ex: 2017年11月22日(水) 09:00 ～ 10:00*/ {
      date = {
        is_all_day: false,
        from: new Date(parseInt(RegExp.$1), monthIndex(parseInt(RegExp.$2)), parseInt(RegExp.$3), parseInt(RegExp.$4), parseInt(RegExp.$5)),
        to: new Date(parseInt(RegExp.$1), monthIndex(parseInt(RegExp.$2)), parseInt(RegExp.$3), parseInt(RegExp.$6), parseInt(RegExp.$7))
      };
    } else if (text.match(/^(\d+)年(\d+)月(\d+)日\(.\)$/)) /*ex: 2017年11月27日(月)*/ {
      // 2017/01/01 の終日予定は 2017/01/01～2017/01/02 として設定する必要がある
      date = {
        is_all_day: true,
        from: new Date(parseInt(RegExp.$1), monthIndex(parseInt(RegExp.$2)), parseInt(RegExp.$3)),
        to: new Date(parseInt(RegExp.$1), monthIndex(parseInt(RegExp.$2)), parseInt(RegExp.$3) + 1)
      }
    } else if (text.match(/^(\d+)年(\d+)月(\d+)日\(.\) ～ (\d+)日\(.\)$/)) /*ex: 2017年11月11日(土) ～ 12日(日)*/ {
      date = {
        is_all_day: true,
        from: new Date(parseInt(RegExp.$1), monthIndex(parseInt(RegExp.$2)), parseInt(RegExp.$3)),
        to: new Date(parseInt(RegExp.$1), monthIndex(parseInt(RegExp.$2)), parseInt(RegExp.$4) + 1)
      }
    } else {
      date = {
        is_all_day: false,
        from: new Date(),
        to:   new Date()
      }
    }
    var z = function(x) {
        return ('00' + x).slice(-2);
    };
    var localDate = function (d) {
      return d.getFullYear() + z(monthNumber(d.getMonth())) + z(d.getDate());
    };
    var localMsec = function (d) {
        return d.getFullYear() + z(monthNumber(d.getMonth())) + z(d.getDate()) + 'T' + z(d.getHours()) + z(d.getMinutes()) + '00';
    };
    return date.is_all_day ?
        {DTSTART:localDate(date.from), DTEND:localDate(date.to) }
      : {DTSTART:localMsec(date.from), DTEND:localMsec(date.to)};
  };

  var prependTriggerButton = function prependTriggerButton($base) {
    if (!$base.querySelector('.docfooter-app-uri a')) return;

    if ($base.querySelector('.docfooter-app-uri a').text == 'スケジュール'
     && document.querySelectorAll('#__mailto_attendance_icon').length == 0) {
      var trigger = document.createElement('a');
      trigger.classList.add('noborder-button');
      trigger.setAttribute('id','__mailto_attendance_icon');
      trigger.setAttribute('href','javascript:void(0)');
      trigger.setAttribute('title','出席者全員にメール');
      trigger.addEventListener('click', function () {
        return mailtoAttendance();
      });
      var icon = document.createElement('span');
      icon.classList.add('icon');
      icon.classList.add('ico-create');
      icon.classList.add('__mailto_attendance_icon');
      icon.textContent = '出席者全員にメール';
      trigger.insertBefore(icon, trigger.firstChild);
      $base.querySelector('.buttons-wrap').appendChild(trigger);

      var triggerExport = document.createElement('a');
      triggerExport.classList.add('noborder-button');
      triggerExport.setAttribute('id', '__ical_export_icon');
      triggerExport.setAttribute('href', 'javascript:void(0)');
      triggerExport.setAttribute('title', 'iCalエクスポート');
      triggerExport.addEventListener('click',function () {
        return downloadIcoFile();
      });
      var scheduleIcon = document.createElement('span');
      scheduleIcon.classList.add('icon');
      scheduleIcon.classList.add('ico-schedule');
      scheduleIcon.classList.add('__ical_export_icon');
      scheduleIcon.textContent = 'iCalエクスポート';
      triggerExport.insertBefore(scheduleIcon, triggerExport.firstChild);
      $base.querySelector('.buttons-wrap').appendChild(triggerExport);
    }
  };

  // スケジュール画面
  // レポート機能と出欠登録機能が使えなくなる(タイミングの問題？詳しい原因不明)
  // を回避するために MutationObserver を使ってタイミングをずらす
  var wrapperQuery = '#wrapper';
  new MutationObserver(function () {
    prependTriggerButton(document.querySelector(wrapperQuery));
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
          return prependTriggerButton(document.querySelector(modalQuery));
        }, 0);
      }).observe(modal, { childList: true });
    }
  }).observe(document.querySelector('#popup_field'), { childList: true });
})();