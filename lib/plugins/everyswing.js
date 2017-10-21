(function () {

    "use strict";

    const client = require('cheerio-httpcli');

    const DATE_REGEXP = /^(\d{1,2}) \(.\)$/g;

    function getURL () {
	return "http://www.every-swing.com";
    }

    function getScheduleURL() {
	return "http://www.every-swing.com/sche_06/sche6.cgi";
    }

    function getSchedule (year, month, callback) {
	const args = {
	    q: {
		year: year,
		mon: month
	    }
	};
	
	client.fetch(getScheduleURL(), args, function (err, $, res) {
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
		    if (!dayOfMonth) {
			return;
		    } else if (!!schedule[dayOfMonth]) {
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
