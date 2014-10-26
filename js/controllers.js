var dicControllers = angular.module('dicControllers',[]);

dicControllers.controller('DicListCtrl', function($scope){
	$scope.dics = [
		{'di' : '1', 'name':'dic 1'},
		{'di' : '2', 'name':'dic 2'}
	];
});
