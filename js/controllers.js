var dicControllers = angular.module('dicControllers',[]);

dicControllers.controller('DicListCtrl', function($log, $scope, Dic){
	Dic.getAll().success(function(dics){
		$scope.dics = dics;
	});
	$scope.addDictionary = function(){
		$log.log($scope.newDicName);
		var newDic = {name: $scope.newDicName};
		Dic.add(newDic).success(function(dics){
			Dic.getAll().success(function(dics){
				$scope.dics = dics;
			});
		});
	};
	$scope.deleteDictionary = function(id){
		Dic.delete(id).success(function(dics){
			Dic.getAll().success(function(dics){
				$scope.dics = dics;
			});
		});
	};
});

dicControllers.controller('CardListCtrl', function($scope, $routeParams, Card){
	$scope.dicId = $routeParams.dicId;
	Card.getByDicId($routeParams.dicId).success(function(cards){
		$scope.cards = cards;
	});
});

dicControllers.controller('CardEditCtrl', function($log, $scope, $routeParams, $location, Card){
	$scope.dicId = $routeParams.dicId;
	$scope.card = {dictionary_id: $routeParams.dicId};
	$scope.saveCard = function(){
		$log.log($scope.card);
		Card.save($scope.card).success(function(){
			$location.path('/dics/' + $routeParams.dicId + '/cards');
		});
	};
});
