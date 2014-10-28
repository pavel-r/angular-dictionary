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
	$scope.deleteCard = function(card){
		Card.delete(card._id, card.dictionary_id).success(function(){
			Card.getByDicId($routeParams.dicId).success(function(cards){
				$scope.cards = cards;
			});
		});
	};
});

dicControllers.controller('CardLearnCtrl', function($log, $scope, $routeParams, $location, Card){
	$scope.nextCard = function(){
		if($scope.cards.length > 0) {
			$("#translation").css("visibility", "hidden");
			$scope.card = $scope.cards.pop();
		} else {
			resetScopeWithCards();
		}
	};
	var resetScopeWithCards = function(){
		Card.getByDicId($routeParams.dicId).success(function(cards){
			$scope.cards = _.shuffle(_.filter(cards , function(card) {return !card.learnt;}));
			if($scope.cards.length == 0 ){
				$location.path('/dics');
			}
			$scope.nextCard();
		});
	}
	resetScopeWithCards();
	$scope.showTranslation = function(){
		$("#translation").css("visibility", "visible");
	};
});

dicControllers.controller('CardAddCtrl', function($log, $scope, $routeParams, $location, Card){
	$scope.dicId = $routeParams.dicId;
	$scope.card = {dictionary_id: $routeParams.dicId};
	$scope.saveCard = function(){
		$log.log($scope.card);
		Card.save($scope.card).success(function(){
			$location.path('/dics/' + $routeParams.dicId + '/cards');
		});
	};
});

dicControllers.controller('CardEditCtrl', function($log, $scope, $routeParams, $location, Card){
	$log.log('CardEditCtrl');
	$scope.dicId = $routeParams.dicId;
	$scope.card = Card.get($routeParams.cardId, $routeParams.dicId).success(function(card){
		$scope.card = card;
		$scope.saveCard = function(){
			$log.log($scope.card);
			Card.update($routeParams.cardId, $scope.card).success(function(){
				$location.path('/dics/' + $routeParams.dicId + '/cards');
			});
		};
	});
});
