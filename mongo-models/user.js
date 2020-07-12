const mongodb = require('mongodb');
const objectId = mongodb.ObjectId;
const getDB = require('../util/database').getDB;

class User {
    constructor(userName, email, cart, id) {
        this.userName = userName;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }

    save() {
        const db = getDB();
        return db.collection('user')
            .insertOne(this);
    }

    addToCart(product) {
        const db = getDB();
        const cartProductIndex = this.cart.items.length > 0 ?
            this.cart.items.findIndex(item => item.productId.toString() === product._id.toString())
            : -1;
        let newQty = 1;
        const updatedCartItems = [...this.cart.items];
        if (cartProductIndex >= 0) {
            newQty = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQty;
        } else {
            updatedCartItems.push({productId: new objectId(product._id), quantity: newQty})
        }
        const updatedCart = {
            items: updatedCartItems
        }
        db.collection('users')
            .updateOne(
                {_id: new objectId(this._id)},
                {$set: {cart: updatedCart}}
            );
    }

    getCart() {
        const db = getDB();
        const productIds = this.cart.items.map(item => {
            return item.productId;
        })
        return db.collection('products')
            .find({
                _id: {$in: productIds}
            })
            .toArray()
            .then(products => {
                return products.map(product => {
                    const cartProduct = this.cart.items.find(item => item.productId.toString() === product._id.toString());
                    return {
                        ...product,
                        quantity: cartProduct.quantity
                    }
                });
            })
            .catch(err => console.log(err));
    }

    deleteItemFromCart(productId) {
       const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());
        const db = getDB();
        return db.collection('users')
            .updateOne(
                {_id: new objectId(this._id)},
                {$set: {cart: {items: updatedCartItems} } }
            );
    }

    addOrder() {
        const db = getDB();
        return this.getCart()
            .then(products => {
                const order = {
                    items: products,
                    user: {
                        id: new objectId(this._id),
                        name: this.userName,
                        email: this.email
                    }
                }
                return db.collection('orders').insertOne(order);
            })
            .then(result => {
                this.cart = { item: []};
                return db.collection('users')
                    .updateOne(
                        {_id: new objectId(this._id)},
                        {$set: {cart: {items: []} } }
                    );
            })
    }

    getOrders() {
        const db = getDB();
        return db.collection('orders')
            .find({'user.id': new objectId(this._id)})
            .toArray();
    }

    static findById(userId) {
        const db = getDB();
        return db.collection('users').findOne({_id: new objectId(userId)})
            .then(user => {
                return user;
            })
            .catch(err => console.log(err));
    }
 }

module.exports = User;