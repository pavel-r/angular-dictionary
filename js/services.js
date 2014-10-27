var dicServices = angular.module('dicServices',['ngResource']);

dicServices.factory('Dic', function($http){
	return {
		getAll: function(){
			return $http.get('dictionaries');
		},
		delete: function(id){
			return $http.delete('dictionaries/' + id);
		},
		add: function(dic){
			return $http.post('dictionaries', dic);
		}
	};
});

dicServices.factory('Card', function($http){
	return {
		getByDicId: function(dicId){
			return $http.get('dictionaries/'+dicId+'/cards');
		},
		save: function(card){
			return $http.post('dictionaries/+' + card.dictionary_id + '/cards', card);
		}
	};
});