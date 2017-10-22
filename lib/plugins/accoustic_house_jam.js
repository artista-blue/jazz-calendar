(function () {

    "use strict";

    const client = require('cheerio-httpcli');

    const DATE_REGEXP = /^(\d{1,2}) \(.\)$/g;

    function getURL () {
	return "http://www2s.biglobe.ne.jp/~acoustic/"
    }

    function getScheduleURL(year, month) {
	const yy = year % 100;
	const mm = `0${month}`.slice(-2);
	return `http://www2s.biglobe.ne.jp/~acoustic/new/schedule/${yy}${mm}.htm`;
    }

    const REGEX_DATE = /^[１２３４５６７８９０・]+$/;

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

    function isDateRecord ($, children) {
	let arr = [];
	children.each(function (idx) {
	    const text = $(this).text().replace(' ','').trim();
	    arr.push(REGEX_DATE.test(text))
	});
	const flag = arr.some(function (x) { return x === true });
	if (!flag) {
	    return [flag];
	} else {
	    let dates = [];
	    children.each(function (idx) {
		const text = $(this).text().replace(' ','').trim();
		dates.push(text);
	    });
	    dates = dates.map(function (x) {
		if (x.indexOf('・') >= 0 || x === '') {
		    return null;
		} else {
		    return x;
		}
	    });
	    dates = dates.map(toHalfNumber);
	    return [flag, dates];
	}
    }

    function getSchedule (year, month, callback) {
	const args = {};;
	client.fetch(getScheduleURL(year, month), args, function (err, $, res) {
	    const schedule = {};
	    schedule[year] = {};
	    schedule[year][month] = {};

	    let dateArray;

	    $('table tr').each(function (idx) {
		const children = $(this).children();
		if (children.length <= 1) {
		    return;
		}
		const isDR = isDateRecord($, children)
		if (isDR[0] === true) {
		    dateArray = isDR[1];
		    //console.log(dateArray);
		    return;
		} else {
		    if (!dateArray) {
			return;
		    }
		    children.each(function (idx) {
			let text = $(this).text();
			text = text.replace(/\n/g, '');
			text = text.replace(/ +/g, ' ');
			const dayOfMonth = dateArray[idx];
			schedule[year][month][dayOfMonth] = text;
		    });
		    dateArray = undefined;
		}
	    });
	    callback(err, schedule);
	});
    }

    module.exports = getSchedule;

})();
