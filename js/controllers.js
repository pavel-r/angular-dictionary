var dicControllers = angular.module('dicControllers',[]);

dicControllers.controller('DicListCtrl', function($log, $scope, Dic){
	$scope.dics = Dic.query();
	$scope.addDictionary = function(){
		var newDic = new Dic({name: $scope.newDicName});
		newDic.$save();
		$scope.dics = Dic.query();
	};
	$scope.deleteDictionary = function(dic){
		dic.$delete();
		$scope.dics = Dic.query();
	};
});

dicControllers.controller('CardListCtrl', function($scope, $routeParams, Card, Dic){
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
	$scope.learnAll = function(){
		Dic.learnAll($routeParams.dicId).success(function(){
			Card.getByDicId($routeParams.dicId).success(function(cards){
				$scope.cards = cards;
			});
		});
	};
	$scope.reset = function(){
		Dic.reset($routeParams.dicId).success(function(){
			Card.getByDicId($routeParams.dicId).success(function(cards){
				$scope.cards = cards;
			});
		});
	};
	$scope.toggleCard = function(card){
		card.learnt = !card.learnt;
		Card.update(card._id, card).success(function(){
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
			if($scope.cards.length === 0 ){
				$location.path('/dics');
			} else {
				$scope.nextCard();
			}
		});
	};
	resetScopeWithCards();
	$scope.showTranslation = function(){
		$("#translation").css("visibility", "visible");
	};
	$scope.learn = function(){
		$scope.card.learnt = true;
		Card.update($scope.card._id, $scope.card);
		$scope.nextCard();
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
	$scope.translate = function(){
		Card.translate($scope.card).success(function(translation){
			$("#dicTranslation").html(translation);
			$scope.card.translation = $('#dicTranslation').find('span[lang=ru_RU]').first().text();
			$scope.card.sound = $('#dicTranslation').find('a').first().attr('href');
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
