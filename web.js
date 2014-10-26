/*
The MIT License (MIT)

Copyright (c) 2014 Pavel Rabetski

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var fs = require('fs');
var express = require('express');
var http = require('http');
var app = express();

//common configuration
app.configure(function(){
	app.use(express.logger());
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({secret: '12345qwerty', key: 'sid'}));
	app.use('/css',express.static('css'));
	app.use('/js',express.static('js'));
	app.use('/lib',express.static('lib'));
	app.use('/partials',express.static('partials'));
});

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

//connect to db
var p_db;
//get db connection string
var conString = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/test';
console.log("Connecting to database: " + conString);
var conOptions = {server: {auto_reconnect:true}};
MongoClient.connect(conString, conOptions, function(err, db){
    if(err){
		console.log(err);
    } else {
		console.log('Connected to DB!');
		p_db = db;
    }
});

//*************MAIN ACTIONS**********************************

app.get('/', function (request, response) {
	if(request.session.username){
		var content = fs.readFileSync('index.html');
		response.send(content.toString());
	} else {
		response.redirect('/login');
	}
});

app.get('/login', function(request, response){
	var content = fs.readFileSync('login.html');
	response.send(content.toString());
});

app.post('/login', function (request, response) {
    var username = request.body.username;
    var password = request.body.password;
    p_db.collection('users').findOne({name : username, password : password}, function(err, user){
        console.log(user);
		if(user){
			request.session.username = username;
			request.session.userid = user._id;
			response.redirect('/');
		} else {
			response.redirect('/login');
		}
    });
});

//*************REST API**********************************

//get all dictionaries for user
app.get('/dictionaries', function(request, response) {
	var userId = request.session.userid;
	if(!userId){
		console.log('User is not logged in!');
		return "[]";
	}
	p_db.collection('dictionaries').find({user_id : ObjectID(userId)}).toArray(function(err, dictionaries){
		console.log('Found dictionaries for user +' + userId + ':' + JSON.stringify(dictionaries));
		response.send(dictionaries);
	});
});

//add dictionary
app.post('/dictionaries', function(request, response) {
	var userId = request.session.userid;
	if(!userId){
		console.log('User is not logged in!');
		return "[]";
	}
	var dictionary = request.body;
	dictionary.user_id = ObjectID(userId);
	console.log('Adding dictionary: ' + JSON.stringify(dictionary));
	p_db.collection('dictionaries').insert(dictionary, function(err, result){
		console.log('Dictionary added');
		response.send('[]');
	});
});

//delete dictionary
app.delete('/dictionaries/:id', function(request, response) {
	var id = request.params.id;
	console.log('Deleting dictionary ' + id);
	p_db.collection('cards').remove({dictionary_id : ObjectID(id)}, function(err, result){
		console.log(result + ' cards for dictionary ' + id + ' deleted');
		p_db.collection('dictionaries').remove({_id: ObjectID(id)}, function(err, result){
			console.log('Dictionary ' + id + ' deleted');
			response.send('[]');
		});
	});
});

//mark all words as not-learnt
app.post('/dictionaries/:id/reset', function(request, response) {
	var id = request.params.id;
	console.log('Updating dictionary ' + id);
	p_db.collection('cards').update({dictionary_id : ObjectID(id)}, {$set: {learnt : false}}, {multi : true}, function(err, result){
		if(err){
			console.log(err);
		} else {
			console.log("Cards updated");
		}
		response.send("[]");
	});
});

//mark all words as learnt
app.post('/dictionaries/:id/learn', function(request, response) {
	var id = request.params.id;
	console.log('Updating dictionary ' + id);
	p_db.collection('cards').update({dictionary_id : ObjectID(id)}, {$set: {learnt : true}}, {multi : true}, function(err, result){
		if(err){
			console.log(err);
		} else {
			console.log("Cards updated");
		}
		response.send("[]");
	});
});

//get all cards for dictionary
app.get('/dictionaries/:dic_id/cards', function (request, response) {
	var userId = request.session.userid;
	if(!userId){
		console.log('User is not logged in!');
		return "[]";
	}
	var dic_id = request.params.dic_id;
	console.log('Getting all cards for dictionary ' + dic_id);
	//TODO: check for proper rights for this dictionary
	p_db.collection('cards').find({dictionary_id : ObjectID(dic_id)}).sort({word : 1}).toArray(function(err, cards){
		console.log('Cards found: ' + JSON.stringify(cards));
		response.send(cards);
	});
});

//get card by id
app.get('/dictionaries/:dic_id/cards/:card_id', function(request, response) {
	var userId = request.session.userid;
	if(!userId){
		console.log('User is not logged in!');
		return "[]";
	}
	var card_id = request.params.card_id;
	console.log('Finding card with id ' + card_id);
	p_db.collection('cards').findOne({_id: ObjectID(card_id)}, {"_id" : 0}, function(err, card){
		console.log('Found card:' + JSON.stringify(card));
		response.send(card);
	});
});

//add card for dictionary
app.post('/dictionaries/:dic_id/cards', function(request, response) {
	var card = request.body;
	card.dictionary_id = ObjectID(card.dictionary_id);
	console.log('Adding card ' + JSON.stringify(card) +' for dictionary ' + card.dictionary_id);	
	p_db.collection('cards').insert(card, function(err, result){
		console.log('Card added');
		response.send("[]");
	});
});

//update card
app.put('/dictionaries/:dic_id/cards/:card_id', function (request, response) {
    var card_id = request.params.card_id;
	var card = request.body;
	card.dictionary_id = ObjectID(card.dictionary_id);
	console.log('Updating card ' + card_id + ': ' + JSON.stringify(card));
	p_db.collection('cards').update({_id : ObjectID(card_id)}, {$set: card}, function(err, result){
		if(err){
			console.log(err);
		} else {
			console.log("Cards updated");
		}
		response.send("[]");
	});
});

//delete card
app.delete('/dictionaries/:dic_id/cards/:card_id', function(request, response) {
	var card_id = request.params.card_id;
	console.log('Deleting card ' + card_id);
	p_db.collection('cards').remove({_id: ObjectID(card_id)}, function(err, result){
		console.log('Card deleted');
		response.send('[]');
	});
});

//translate word
app.get('/translate/:word', function (request, response){
	var word = encodeURIComponent(request.params.word);
	var options = {
	  host: 'lexin.nada.kth.se',
	  path: '/lexin/service?searchinfo=to,swe_rus,' + word
	};
	http.get(options, function(resp){
		resp.setEncoding('utf8');
		resp.on('data', function (chunk) {
			//var card = parseTranslation(chunk);
			//card.word = word;
			response.send(chunk);
		});
	}).on('error', function(e){
		console.log("Error requesting Lexin: " + e.message);
		response.send("");
	});
});

//*************START APPLICATION**********************************

var port = process.env.PORT || 5000;
http.createServer(app).listen(port);

/*
app.listen(port, function(){
    console.log('Server started on port ' + port);
});
*/
