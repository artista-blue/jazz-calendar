(function () {

    "use strict";

    const fs = require("fs");    
    const path = require("path");

    const async = require("async");
    const moment = require("moment");

    function getPlugins () {
	const plugins = [];
	const pluginDir = path.join(__dirname, "plugin");
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
	const data = {};
	const plugins = getPlugins();
	async.each(plugins, (plugin, next) => {
	    plugin.plugin(2017, 10, function (err, pluginData) {
		data[plugin.name] = pluginData;
		next(err);
	    });
	}, function (err) {
	    callback(err, data);
	});
    }

    function filter (data, y, m, d) {
	const today = {};
	Object.keys(data).forEach((key) => {
	    let _data ;
	    try {
		_data = data[key][y][m][d];
		today[key] = _data;
	    } catch (e) {
	    }
	});
	return today;
    }

    class Schedule {

	static getToday (callback) {
	    const now = moment();
	    const year = now.get('year');
	    const month = now.get('month') + 1;
	    const day = now.get('date');
	    getAll((err, data) => {
		const json = {
		    year: year,
		    month: month,
		    day: day,
		    schedule: filter(data, year, month, day)
		};
		callback(err, json)
	    });
	}
    }

    module.exports = Schedule;

})();
