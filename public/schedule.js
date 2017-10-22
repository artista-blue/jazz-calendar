(function () {

    "use strict";

    Controllers.controller('ScheduleViewController', ScheduleViewController);
    ScheduleViewController.$inject = ['$scope', '$location', '$http'];
    function ScheduleViewController ($scope, $location, $http) {
	$scope.cal = new Date();

	$scope.$watch('cal', function () {
	    const m = moment($scope.cal);
	    const year = m.get('year');
	    const month = m.get('month') + 1;
	    const date = m.get('date');
	    $http({
		method : 'GET',
		url : `${config.CONTEXT_PATH}/schedule/${year}/${month}/${date}`
            }).success(function(data, status, headers, config) {
		$scope.schedule = data;
		console.log(data);
            }).error(function(data, status, headers, config) {
		console.log(status);
            });
	});
    }
})();
