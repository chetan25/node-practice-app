const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (cb) => {
    MongoClient.connect('mongodb+srv://myadmin:NW4aX1rgTWzASVLG@cluster0-topzy.mongodb.net/shop?retryWrites=true&w=majority')
        .then(client => {
            console.log('connected');
            _db = client.db();
            cb();
        })
        .catch(err => {
            console.log(err);
            throw err;
        })
};

const getDB = () => {
    if (_db) {
        console.log('connected');
        return _db;
    }
    //throw "No database found";
}

exports.mongoConnect = mongoConnect;
exports.getDB = getDB;