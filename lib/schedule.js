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

    function getAll (callback) {
	console.log("getAll");
	const plugins = getPlugins();
	async.each(plugins, (plugin, next) => {
	    plugin.plugin(2017, 10, function (err, pluginData) {
		data[plugin.name] = pluginData;
		next(err);
	    });
	}, function (err) {
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
		const todaysData = {
		    name: livehouse[lh].name,
		    url: livehouse[lh].url,
		    data: data[lh][y][m][d]
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
