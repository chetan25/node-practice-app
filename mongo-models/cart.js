const fs = require('fs');
const path = require('path');

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'cart.json'
);

module.exports = class Cart {
    static addProduct(id, productPrice) {
        // fetch previous cart
        fs.readFile(p, (err, fileContent) => {
            let cart = {
                products: [],
                totalPrice: 0
            }
            if(!err) {
                cart = JSON.parse(fileContent);
            }
            let updatedProduct;
            const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
            if (existingProductIndex >= 0) {
                const existingProduct = cart.products[existingProductIndex];
                updatedProduct = {...existingProduct};
                updatedProduct.qty = updatedProduct.qty + 1;
                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                updatedProduct = {
                    id: id,
                    qty: 1
                }
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totalPrice = cart.totalPrice + +productPrice;
            console.log(cart, 'cart');
            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err);
            });
        })
    };

    static deleteProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
           if (err) {
               return;
           }
           const cart = JSON.parse(fileContent);
           const updatedCart = {...cart};
           const product = updatedCart.products.find(prod => prod.id === id);
           if (!product) {
               return;
           }
           const productQty =  product.qty;
           updatedCart.totalPrice = cart.totalPrice - (productPrice * productQty);
           updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);
            fs.writeFile(p, JSON.stringify(updatedCart), err => {
                console.log(err);
            });
        });
    };

    static getCart(cb) {
        fs.readFile(p, (err, fileContent) => {
            if (err) {
                cb(null);
            } else {
                const cart = JSON.parse(fileContent);
                cb(cart);
            }
        })
    }
};