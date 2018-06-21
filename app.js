var express = require('express'),
    app = express(),
    mongodb = require('mongodb').MongoClient,
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    ObjectId = require('mongoose').Types.ObjectId;

mongoose.Promise = require('q').Promise;
    
mongoose.connect('mongodb://localhost/angularApp');
var db = mongoose.connection;
    
db.on('error', function() {
    console.log('Error happened!');
});
    
db.on('open', function() {
    console.log('Mongoose Connected!');
});

var message_schema = mongoose.Schema({
    recipient: String,
    recipient_img: String,
    sender: String,
    sender_img: String,
    title: String,
    description: String,
    created_at: String,
    important: String,
    replies: Array
});

var message_model = mongoose.model('messages', message_schema);

    
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
    
app.post('/userSignup', function(req, res) {
    db.collection('users').insert(req.body, function (err) {
        if(!err) {
            res.send({
                flg: true
            });
        }
    });
});

app.post('/profileUpdate', function(req, res) {
    var updateFields = {
        "username": req.body.username,
        "password": req.body.password,
        "firstname": req.body.firstname,
        "lastname": req.body.lastname,
        "email": req.body.email,
        "phone": req.body.phone,
        "location": req.body.location
    }
    db.collection('users').update({"isLoggedIn" : true}, {$set: updateFields});
});

app.post('/mark', function(req, res) {
    var updateFields = {
        "important": req.body.important,
    }
    var query = { _id: new ObjectId(req.body.id) };
    db.collection('messages').update(query, {$set: updateFields});
    res.send({
        flg: true
    });
});

app.post('/reply', function(req, res) {
    var query = { _id: new ObjectId(req.body.id) };
    db.collection('messages').update(query, { $push: { "replies": req.body.replies } });
    res.send({
        flg: true
    });
});

app.get('/userLogout', function(req, res) {
    db.collection('users').update({"isLoggedIn" : true}, {$unset: {"isLoggedIn": ''}});
    res.send({
        flg: true
    });
});

app.get('/checkUserStatus', function(req, res) {
    
    db.collection('users').find({"isLoggedIn" : true}).toArray(function(err, docs) {
        res.send(docs);
    });
});

app.get('/checkImportant/:username', function(req, res) {
    
    db.collection('messages').find({"recipient" : req.params.username, "important" : "1"}).toArray(function(err, docs) {
        res.send(docs);
    });
});

app.get('/deleteMessage/:id', function(req, res) {
    var query = { _id: new ObjectId(req.params.id) };
    console.log(query);
    db.collection('messages').remove(query);
    res.send({
        flg: true
    });
});

app.get('/messages/:username', function(req, res) {
    
    db.collection('messages').find({"recipient" : req.params.username}).toArray(function(err, docs) {
        res.send(docs);
    });
});

app.get('/userLogin/:username/:password', function(req, res) {
    db.collection('users').update({"isLoggedIn" : true}, {$unset: {"isLoggedIn": ''}});
    db.collection('users').find({"username": req.params.username, "password": req.params.password}).toArray(function(err, docs) {
        if (docs.length !== 0) {
            db.collection('users').update({"username": req.params.username, "password": req.params.password}, {$set: {"isLoggedIn": true}});
            
        }
        res.send(docs);
    });
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


app.listen(3000, function() {
    console.log('server running at 3000');
});

