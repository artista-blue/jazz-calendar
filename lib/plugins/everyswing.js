(function () {

    "use strict";

    const client = require('cheerio-httpcli');

    const DATE_REGEXP = /^(\d{1,2}) \(.\)$/g;

    function getURL () {
	return "http://www.every-swing.com";
    }

    function getScheduleURL(year, month) {
	return `http://www.every-swing.com/sche_06/sche6.cgi?year=${year}&mon=${month}`;
    }

    function getSchedule (year, month, callback) {
	const args = {
	    q: {
		year: year,
		mon: month
	    }
	};
	
	const url = getScheduleURL(year, month);
	console.log(url);
	client.fetch(url, function (err, $, res) {
	    const schedule = {};
	    schedule[year] = {};
	    schedule[year][month] = {};
	    let dayOfMonth;
	    $('table tr td').each(function (idx) {
		const text = $(this).text();
		let group;
		group = DATE_REGEXP.exec(text);
		if (group) {
		    dayOfMonth = group[1];
		    return;
		} else {
		    const event = text.trim();
		    if (event === "OFF") {
			return;
		    }
		    if (!dayOfMonth) {
			return;
		    } else if (!!schedule[dayOfMonth]) {
			return;
		    }
		    if (schedule[year][month][dayOfMonth]) {
			return;
		    }
		    schedule[year][month][dayOfMonth] = event;
		}
	    });
	    callback(err, schedule);
	});
    }

    module.exports = getSchedule;

})();
