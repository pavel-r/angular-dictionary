var dicApp = angular.module('dicApp', ['ngRoute', 'dicControllers', 'dicServices']);

dicApp.config(function($routeProvider){
	$routeProvider.
		when('/dics', {
			templateUrl: 'partials/dic-list.html',
			controller: 'DicListCtrl'
		}).
		when('/dics/:dicId/cards',{
			templateUrl: 'partials/card-list.html',
			controller: 'CardListCtrl'
		}).
		when('/dics/:dicId/cards/edit',{
			templateUrl: 'partials/card-edit.html',
			controller: 'CardEditCtrl'
		}).
		otherwise({
			redirectTo: '/dics'
		});
});