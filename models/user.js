const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Product = require('./product');

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExp: Date,
    cart: {
       items: [
           {
               productId: {
                   type: Schema.Types.ObjectId,
                   ref: 'Product',
                   required: true
               },
               quantity: {
                   type: Number,
                   required: true
               }
           }
       ]
    }
});

userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.length > 0 ?
        this.cart.items.findIndex(item => item.productId.toString() === product._id.toString())
        : -1;
    let newQty = 1;
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
        newQty = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQty;
    } else {
        updatedCartItems.push({productId: product._id, quantity: newQty})
    }
    const updatedCart = {
        items: updatedCartItems
    }
    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.deleteItemFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());
    this.cart.items = updatedCartItems;

    return this.save();
}

userSchema.methods.clearCart = function() {
    this.cart = {
        items: []
    }

    return this.save();
}

module.exports = mongoose.model('User', userSchema);