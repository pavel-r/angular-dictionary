var dicControllers = angular.module('dicControllers',[]);

dicControllers.controller('DicListCtrl', function($log, $scope, Dic){
	$scope.dics = Dic.query();
	$scope.addDictionary = function(){
		var newDic = new Dic({name: $scope.newDicName});
		newDic.$save({},function(){
			$scope.dics = Dic.query();
		});
	};
	$scope.deleteDictionary = function(dic){
		dic.$delete({},function(){
			$scope.dics = Dic.query();
		});
	};
});

dicControllers.controller('CardListCtrl', function($log, $scope, $routeParams, Card){
	$scope.cards = Card.query({dicId: $routeParams.dicId});
	$scope.deleteCard = function(card){
		card.$delete({}, function(){
			$scope.cards = Card.query({dicId: $routeParams.dicId});
		});
	};
	$scope.toggleCard = function(card){
		card.learnt = !card.learnt;
		card.$update();
	};
	$scope.learnAll = function(){
		$log.log("Mark all learnt for: " + $routeParams.dicId);
		Card.learnAll({dicId: $routeParams.dicId}, function(){
			$scope.cards = Card.query({dicId: $routeParams.dicId});
		});
	};
	$scope.reset = function(){
		Card.reset({dicId: $routeParams.dicId}, function(){
			$scope.cards = Card.query({dicId: $routeParams.dicId});
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
		$scope.cards = Card.query({dicId: $routeParams.dicId, learnt: false}, function(cards){
			if(cards.length === 0 ){
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
		$scope.card.$update();
		$scope.nextCard();
	};
});

dicControllers.controller('CardAddCtrl', function($log, $scope, $routeParams, $location, Card){
	$scope.dicId = $routeParams.dicId;
	$scope.card = new Card({dictionary_id: $routeParams.dicId});
	$scope.saveCard = function(){
		$log.log($scope.card);
		$scope.card.$save({}, function(){
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
