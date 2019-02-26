(function () {

    "use strict";

    const client = require('cheerio-httpcli');

    function getURL() {
	return "http://www.jammin-meguro.sakura.ne.jp"
    }

    function getScheduleURL() {
	return "http://www.jammin-meguro.sakura.ne.jp/event.htm"
    }

    function getTables($) {
	const tables = $('table');
	const list = []
	for (let i = 7; i < tables.length; i++) {
	    const table = tables.get(i);
	    list.push(table)
	}
	return list
    }

    function parseDate(dtStr) {
	const arr = dtStr.trim().split(/\s/)
	const m = arr.shift().match(/^●(\d+)年(\d+)月(\d+)日.*$/)
	const other = arr.join(' ');
	//console.log('arr=')
	//console.log(arr)
	//console.log(m)
	//console.log(other)
	return {
	    y: Number(m[1]),
	    m: Number(m[2]),
	    d: Number(m[3]),
	    other: other
	};
    }

    function parseInfo(infoStr) {
	return infoStr.replace(/\n/g, '').replace(/\t/g, '').trim()
    }
    
    function getSchedule (year, month, callback) {
	const args = {};
	client.fetch(getScheduleURL(year, month), args, function (err, $, res) {
	    const schedule = {};
	    schedule[year] = {};
	    schedule[year][month] = {};

	    let dateArray;
	    let isFirstRow = true;

	    const tables = getTables($);
	    tables.forEach((table) => {
		console.log("=====================")
		const tbl = $(table)		
		console.log(tbl.text())
		const tbody = tbl[0].children.filter(function (x) { return x.name === 'tbody' });
		const children = tbody[0].children;
		const trs = children.filter(function (x) { return x.name === 'tr'; });
		const {y, m, d, other} = parseDate($(trs[0]).text());
		console.log(y, m, d, other)
		if (year != y || month != m) {
		    return;
		}
		const info = parseInfo($(trs[1]).text());
		if (!other.includes('SESSION') && !info.includes('SESSION')) {
		    return;
		}
		const prev = schedule[y][m][d];
		if (prev) {
		    schedule[y][m][d] = prev + ' ' + other + ' ' + info;
		} else {
		    schedule[y][m][d] = other + ' ' + info;
		}
	    });
	    callback(err, schedule);
	});
    }

    module.exports = getSchedule;

    /*
    getSchedule(2019, 3, function(err, schedule) {
	if (err) {
	    console.error(err)
	}
	console.log(schedule)
    })
    */
    
})();
