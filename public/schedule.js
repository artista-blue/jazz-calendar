(function () {

    "use strict";

    Controllers.controller('ScheduleViewController', ScheduleViewController);
    ScheduleViewController.$inject = ['$scope', '$location', '$http'];
    function ScheduleViewController ($scope, $location, $http) {

	const now = moment();
	const year = now.get('year');
	const month = now.get('month');
	const date = now.get('date');
	$http({
            method : 'GET',
            url : `${config.CONTEXT_PATH}/schedule/today`
        }).success(function(data, status, headers, config) {
            $scope.schedule = data;
            console.log(data);
        }).error(function(data, status, headers, config) {
            console.log(status);
        });
    }
})();
