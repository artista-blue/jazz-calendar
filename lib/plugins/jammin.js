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
	for (let i=7; i < tables.length; i++) {
	    console.log('i=' + i)
	    const table = tables.get(i);
	    list.push(table)
	}
	/*
	const table = tables.get(5);
	let children = table.children;
	children = table.children.filter(function (x) { return x.type === 'tag' });
	children = children.splice(1, children.length);
	return children;
	*/
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
		const tbody = tbl[0].children.filter(function (x) { return x.name === 'tbody' })
		const children = tbody[0].children;
		const trs = children.filter(function (x) { return x.name === 'tr'; });
		const {y, m, d, other} = parseDate($(trs[0]).text())
		if (year != y || month != m) {
		    return;
		}
		//console.log(y, m, d, other)
		schedule[y][m][d] = other + ' ' + parseInfo($(trs[1]).text())
	    });
	    /*
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
	    */
	    callback(err, schedule);
	});
    }

    module.exports = getSchedule;

    /**
    getSchedule(2019, 2, function(err, schedule) {
	if (err) {
	    console.error(err)
	}
	console.log(schedule)
    })
    **/
    
})();
