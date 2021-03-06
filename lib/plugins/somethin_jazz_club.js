(function () {

    "use strict";

    const client = require('cheerio-httpcli');

    const REGEXP_DATE = /^\s*(\d{1,2})月\s*(\d{1,2})日.*$/;

    function getURL () {
	return "http://www.somethinjazz.com/jp/index.html";
    }

    function getScheduleURL(year, month) {
	const yy = year % 100;
	const mm = `0${month}`.slice(-2);
	return `http://somethinjazz.sakura.ne.jp/sche3/sche35.cgi?cm=&year=${year}&mon=${month}`;
    }

    /*
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
    */

    function getTRs ($) {
	const tables = $('table');
	const table = tables.get(5);
	let children = table.children;
	children = table.children.filter(function (x) { return x.type === 'tag' });
	children = children.splice(1, children.length);
	return children;
    }

    function parseInfo (str) {
	const arr = str.split('\n');
	const line0 = arr.shift();
	const group = REGEXP_DATE.exec(line0);
	if (!group) {
	    return null;
	}
	let text = arr.join(' ');
	text = text.replace(/\s+/g, ' ').trim();
	const info = {
	    month: Number(group[1]),
	    date: Number(group[2]),
	    text: text
	};
	return info;
    }
    
    function getSchedule (year, month, callback) {
	const args = {};;
	client.fetch(getScheduleURL(year, month), args, function (err, $, res) {
	    const schedule = {};
	    schedule[year] = {};
	    schedule[year][month] = {};

	    let dateArray;
	    let isFirstRow = true;

	    const trList = getTRs($);
	    
	    trList.forEach((tr) => {
		console.log("======================");
		//console.log($(tr).text());
		tr.children.forEach((td) => {
		    console.log("---------------");
		    const info = parseInfo($(td).text());
		    if (info === null) {
			return;
		    }
		    schedule[year][month][info.date] = info.text;
		});
	    });
	    callback(err, schedule);
	});
    }

    module.exports = getSchedule;

})();
