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
	$scope.dicId = $routeParams.dicId;
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
			$scope.cards = Card.query({dicId: $routeParams.dicId, learnt: false}, function(cards){
				cards.length === 0 ? $location.path('/dics') : $scope.nextCard();
			});
		}
	};
	$scope.cards = Card.query({dicId: $routeParams.dicId, learnt: false}, function(cards){
			cards.length === 0 ? $location.path('/dics') : $scope.nextCard();
	});
	$scope.showTranslation = function(){
		$("#translation").css("visibility", "visible");
	};
	$scope.learn = function(){
		$scope.card.learnt = true;
		$scope.card.$update();
		$scope.nextCard();
	};
});

dicControllers.controller('CardAddCtrl', function($log, $scope, $routeParams, $location, Card, Translation){
	$scope.dicId = $routeParams.dicId;
	$scope.card = new Card({dictionary_id: $routeParams.dicId, learnt: false});
	$scope.saveCard = function(){
		$scope.card.$save({}, function(){
			$location.path('/dics/' + $routeParams.dicId + '/cards');
		});
	};
	$scope.translate = function(){
		Translation.get({word: $scope.card.word}, function(translation){
			$("#dicTranslation").html(translation.htmlData);
			$scope.card.translation = $(translation.htmlData).find('span[lang=ru_RU]').first().text();
			$scope.card.sound = $(translation.htmlData).find('a').first().attr('href');
		});
	};
});

dicControllers.controller('CardEditCtrl', function($log, $scope, $routeParams, $location, Card){
	$scope.dicId = $routeParams.dicId;
	$scope.card = Card.get({cardId: $routeParams.cardId, dicId: $routeParams.dicId});
	$scope.saveCard = function(){
		$log.log($scope.card);
		$scope.card.$update({}, function(){
			$location.path('/dics/' + $routeParams.dicId + '/cards');
		});
	};
});
