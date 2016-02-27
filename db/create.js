print('Creating dictionary database ...')
var usersColl = db.getCollection('users');
usersColl.insertOne({name: 'pavel', password: '111'});
db.createCollection('dictionaries');
db.createCollection('cards');
print('Database created');
