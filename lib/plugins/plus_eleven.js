(function () {

    "use strict";

    const puppeteer = require('puppeteer');

    const URL = 'https://www.pluseleven-ageo.com/blank-9/';

    const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

    const getPage = async (browser) => {
	const page = await browser.newPage();
	const options = {
	    viewport: {
		width: 1024,
		height: 600,
	    },
	    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36",
	};
	await page.emulate(options);
	return page;
    };
    
    const getFrames = async (browser) => {
	const page = await getPage(browser);
    	await page.goto(URL);
	await sleep(3000);
	const frames = await page.mainFrame().childFrames()
	const res = [];
	frames.forEach((frame) => {
	    res.push([frame.name(), frame.url()]);
	});
	return res;
    }

    
    const getScheduleFromFrame = async (browser, url) => {
	const map = {};
	let dt;
	const page = await getPage(browser);
	await page.goto(url);
	await sleep(3000);	
	let divs = await page.$$('div > div > div.fc-view-container > div');

	const div = divs[0]
	divs = await div.$$('div');
	for (let i = 0, max = divs.length; i < max; i++) {
	    const div = divs[i];
	    const classnames = await div.getProperty('className')
	    if (await classnames.jsonValue() === 'table-cell-left') {
		const spans = await div.$$('div > span');
		const span = spans[0];
		dt = Number(await (await span.getProperty('textContent')).jsonValue())
	    }
	    if (await classnames.jsonValue() === 'table-cell-right') {
		const labels = await div.$$('ul.list-group > li.list-group-item > label')
		for (let n = 0, nmax = labels.length; n < nmax; n++) {
		    const label = labels[n];
		    const text = await (await label.getProperty('textContent')).jsonValue()
		    map[dt] = text;
		}
	    }
	}
	return map;
    };
    
    const _getSchedule = async (year, month, callback) => {
	const browser = await puppeteer.launch({ headless: true });
	const frames = await getFrames(browser);
	const schedUrl = frames[0][1];
	const events = await getScheduleFromFrame(browser, schedUrl);
	const schedule = {};
	schedule[year] = {};
	schedule[year][month] = events;
	await browser.close();
	if (callback) {
	    callback(null, schedule);
	}
    };
    
    function getSchedule(year, month, callback) {
	_getSchedule(year, month, callback);
    }
    
    module.exports = getSchedule;


    getSchedule(2019, 2, function (err, schedule) {
	console.log(schedule);
    });


})();

