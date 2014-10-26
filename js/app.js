var dicApp = angular.module('dicApp', ['ngRoute', 'dicControllers']);

dicApp.config(function($routeProvider){
	$routeProvider.
		when('/dics', {
			templateUrl: 'partials/dic-list.html',
			controller: 'DicListCtrl'
		}).
		otherwise({
			redirectTo: '/dics'
		});
});