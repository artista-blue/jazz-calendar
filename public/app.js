let app, Controllers;

(function () {

    "use strict";
    
    app = angular.module('app', [
	'ngRoute',
	'ngResource',
	'ui.bootstrap',
	'Controllers'
    ]);

    Controllers = angular.module('Controllers', []);

    Controllers.controller('ScheduleController', ScheduleController);
    ScheduleController.$inject = ['$scope', '$location'];
    function ScheduleController ($scope, $location) {

	$scope.top = function () {
	    $location.path('/');
	};

	$scope.adminView = function () {
	    $location.path('/admin');
	};
	
	$scope.playersView = function () {
	    $location.path('/players');
	};

    	$scope.eventsView = function (type) {
	    $scope.eventType = type;
	    $location.path('/events');
	};
}
    
})();
