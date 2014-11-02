var dicServices = angular.module('dicServices',['ngResource']);

dicServices.factory('Dic', function($resource){
	return $resource('dictionaries/:dicId', {dicId : '@_id'});
});

dicServices.factory('Card', function($resource){
	return $resource('dictionaries/:dicId/cards/:cardId', {dicId : "@dictionary_id", cardId : '@_id'}, {
		update: {method:'PUT'},
		learnAll: {method:'POST', params:{cardId:'learn'}, isArray:true},
		reset: {method:'POST', params:{cardId:'reset'}, isArray:true}
	});
});

dicServices.factory('Translation', function($resource){
	return $resource('translate/:word');
});