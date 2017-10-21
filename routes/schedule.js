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

    module.exports = router;

})();
