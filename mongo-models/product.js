const fs = require('fs');
const path = require('path');
const Cart = require('./cart');

const mongodb = require('mongodb');
const objectId = mongodb.ObjectId;
const getDB = require('../util/database').getDB;

const filePath = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'products.json'
);

const getProductsFromFile = (cb) => {
    fs.readFile(filePath, (err, data) => {
        let products = [];
        if (!err) {
            return cb(JSON.parse(data));
        }
        return cb(products);
    });
};

module.exports = class Product {
    constructor(title, price, description, imageUrl, id, userId) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
        this._id = id ? new objectId(id) : null;
        this.userId = userId;
    }

    save() {
        const db = getDB();
        let dbOp;
        if (this._id) {
            dbOp = db.collection('products')
                .updateOne(
                    {_id: this._id},
                    {$set: this}
                );
        } else {
            dbOp = db.collection('products')
                .insertOne(this);
        }
        return dbOp
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });
        // getProductsFromFile((products) => {
        //     if (this.id) {
        //         const existingProductIndex = products.findIndex(prod => prod.id === this.id);
        //         const updatedProduct = [...products];
        //         updatedProduct[existingProductIndex] = this;
        //         fs.writeFile(filePath, JSON.stringify(updatedProduct), (err) => {
        //             console.log(err);
        //         });
        //     } else {
        //         this.id = Math.random().toString();
        //         products.push(this);
        //         fs.writeFile(filePath, JSON.stringify(products), (err) => {
        //             console.log(err);
        //         });
        //     }
        // })
    }

    static fetchAll(cb) {
        const db = getDB();
        //getProductsFromFile(cb);
        return db.collection('products')
            .find()
            .toArray()
            .then(products => {
                return products;
            })
            .catch(err => {
                console.log(err);
            });
    }

    static findById(id, cb) {
        // getProductsFromFile(products => {
        //     const product = products.find(product => product.id === id);
        //     cb(product);
        // });
        const db = getDB();
        return db.collection('products')
            .find({_id: new objectId(id)})
            .next()
            .then(product => {
                return product;
            })
            .catch(err => {
                console.log(err);
            })
    }

    static deleteById(id) {
        // getProductsFromFile(products => {
        //     const product = products.find(prod => prod.id === id);
        //     const updatedProducts = products.filter(product => product.id !== id);
        //     fs.writeFile(filePath, JSON.stringify(updatedProducts), (err) => {
        //         console.log(err);
        //         if (!err) {
        //             Cart.deleteProduct(id, product.price);
        //         }
        //     });
        // });
        const db = getDB();
        return db.collection('products')
            .deleteOne({_id: new objectId(id)})
            .then(res => {
                console.log('deleted');
                // Cart.deleteProduct(id, product.price);
            })
            .catch(err => console.log(err));
    }
}