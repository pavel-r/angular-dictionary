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
		when('/dics/:dicId/learn',{
			templateUrl: 'partials/card-learn.html',
			controller: 'CardLearnCtrl'
		}).
		when('/dics/:dicId/cards/edit/:cardId',{
			templateUrl: 'partials/card-edit.html',
			controller: 'CardEditCtrl'
		}).
		when('/dics/:dicId/cards/new',{
			templateUrl: 'partials/card-edit.html',
			controller: 'CardAddCtrl'
		}).
		otherwise({
			redirectTo: '/dics'
		});
});