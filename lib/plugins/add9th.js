(function () {

    "use strict";

    const client = require('cheerio-httpcli');
    const os = require('os');

    function toHalfNumber (str) {
	if (str === null) {
	    return str;
	}
	const half = str.replace(/１/g, '1')
	    .replace(/２/g, '2')
	    .replace(/３/g, '3')
	    .replace(/４/g, '4')
	    .replace(/５/g, '5')
	    .replace(/６/g, '6')
	    .replace(/７/g, '7')
	    .replace(/８/g, '8')
	    .replace(/９/g, '9')
	    .replace(/０/g, '0');
	try {
	    return Number(half);
	} catch (e) {
	    return null;
	}
    }

    function getURL () {
	return "http://www2.u-netsurf.ne.jp/~add9th/"
    }
    
    function getScheduleURL(year, month) {
	return "http://www2.u-netsurf.ne.jp/~add9th/mo_dib/mo_dib2.cgi"
    }

    function parseMonth(monthText) {
	const txt = monthText.replace(/\n/g, '').trim();
	const words = txt.split('　');
	const month = toHalfNumber(words[0].replace('月', ''));
	return month
    }

    function parseSchedule($, html) {
	//console.log(html);
	const items = html.split('<br>').filter(function (x) { return x != ''; });
	//console.log(items);
	const schedules = {};
	let key = null;
	const regexp = /　*([０１２３４５６７８９]+)（[月火水木金土日]）(.*)/g;
	items.forEach(function (item) {
	    const text = $('<p>' + item + '</p>').text();

	    const match = regexp.exec(text);
	    if (match) {
		key = toHalfNumber(match[1]);
		schedules[key] = [match[2]];
	    } else {
		const texts = schedules[key];
		texts.push(text);
		schedules[key] = texts;
	    }
	});
	Object.keys(schedules).forEach(function (key) {
	    const _texts = schedules[key];
	    const texts = _texts.map(function (x) { return x.trim(); });
	    schedules[key] = texts.join(os.EOL);
	});
	return schedules;
    }
    
    function getSchedule (year, month, callback) {
	const args = {};
	client.fetch(getScheduleURL(year, month), args, function (err, $, res) {
	    const schedule = {};
	    schedule[year] = {};
	    schedule[year][month] = {};
	    
	    $('table').each(function (groupId) {
		if (groupId != 2 && groupId != 4) {
		    return
		}
		//console.log('=========== Group ' + groupId + ' =============');
		const children = $(this).children();
		const monthText = $(children[0]).text();
		const schedText = $(children[1]).text();
		
		const m = parseMonth(monthText);
		const schedDom = $($($(children[1]).children()[0]).children()[0]).children()[0];
		const html = $(schedDom).entityHtml();
		const monthlySchedule = parseSchedule($, html);
		schedule[year][m] = monthlySchedule
	    });
	    callback(err, schedule);
	});
    }

    module.exports = getSchedule;

    /*
    getSchedule(2019, 3, function (err, schedule) {
	console.log(schedule);
    });
    */

})();
