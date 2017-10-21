(function () {

    "use strict";

    const express = require('express');

    const Schedule = require("../lib/schedule");

    const router = express.Router();

    router.get('/today', function(req, res, next) {
	Schedule.getToday((err, today) => {
	    if (err) {
		res.status(400).end();
	    } else {
		res.json(today);
	    }
	});
    });

    router.get('/:year/:month/:date', function(req, res, next) {
	const year = req.params.year;
	const month = req.params.month;
	const date = req.params.date;
	Schedule.get(year, month, date, (err, today) => {
	    if (err) {
		res.status(400).end();
	    } else {
		console.log(today)
		res.json(today);
	    }
	});
    });
    
    module.exports = router;

})();
