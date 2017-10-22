(function () {

    "use strict";

    const fs = require("fs");    
    const path = require("path");

    const async = require("async");
    const moment = require("moment");

    const livehouse = require("../conf/livehouse.json");

    const data = {};

    function getPlugins () {
	const plugins = [];
	const pluginDir = path.join(__dirname, "plugins");
	let files = fs.readdirSync(pluginDir);
	files = files.filter(function (x) { return x.endsWith("js") === true });
	files.forEach((file) => {
	    const pluginName = file.split('\.')[0];
	    const plugin = require(path.join(pluginDir, file));
	    plugins.push({
		name: pluginName,
		plugin: plugin
	    });
	});
	return plugins;
    }

    function getByMonth(date, callback) {
	const plugins = getPlugins();
	async.each(plugins, (plugin, next) => {
	    plugin.plugin(date.year, date.month, function (err, pluginData) {
		if (!data[plugin.name]) {
		    data[plugin.name] = {};
		}
		if (!data[plugin.name][date.year]) {
		    data[plugin.name][date.year] = {}
		}
		data[plugin.name][date.year][date.month] = pluginData[date.year][date.month];
		next();
	    });
	}, function (err) {
	    callback(err, data);
	});
    }

    function getAll (callback) {
	console.log("getAll");
	const current = moment();
	const next = moment(current).add(1, 'M');
	const prev = moment(current).subtract(1, 'M');
	const dateList = [
	    { year: prev.year(), month: prev.month()+1 },
	    { year: current.year(), month: current.month()+1 },
	    { year: next.year(), month: next.month()+1 }
	];
	async.each(dateList, (date, next) => {
	    getByMonth(date, function () {
		console.log(date)
		next();
	    });
	}, function (err) {
	    console.log(JSON.stringify(data, null , 2));
	    if (!callback) {
		return;
	    }
	    callback(err, data);
	});
    }

    getAll()
    setInterval(getAll, 1000 * 60 * 60);

    function filter (data, y, m, d) {
	const today = [];
	Object.keys(data).forEach((lh) => {
	    try {
		const text = data[lh][y][m][d];
		if (text === undefined) {
		    return;
		}
		const todaysData = {
		    name: livehouse[lh].name,
		    url: livehouse[lh].url,
		    data: text
		}
		today.push(todaysData);
	    } catch (e) {
	    }
	});
	return today;
    }

    class Schedule {

	static get(year, month, date, callback) {
	    const json = {
		year: year,
		month: month,
		date: date,
		schedule: filter(data, year, month, date)
	    };
	    callback(null, json)
	}

	static getToday (callback) {
	    const now = moment();
	    const year = now.get('year');
	    const month = now.get('month') + 1;
	    const date = now.get('date');
	    const json = {
		year: year,
		month: month,
		date: date,
		schedule: filter(data, year, month, date)
	    };
	    callback(null, json)
	}
    }

    module.exports = Schedule;

})();
