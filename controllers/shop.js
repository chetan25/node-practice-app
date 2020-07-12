// const Product = require('../mongo-models/product');
const Cart = require('../mongo-models/cart');

const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  // Product.fetchAll(products => {
  //   res.render('shop/product-list', {
  //     prods: products,
  //     pageTitle: 'All Products',
  //     path: '/products'
  //   });
  // });

  // Mongo Db
  // Product.fetchAll()
  //     .then(products => {
  //         res.render('shop/product-list', {
  //           prods: products,
  //           pageTitle: 'All Products',
  //           path: '/products'
  //         });
  //     });

  Product.find()
      .then(products => {
          res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products'
          });
      })
      .catch(err => {
          console.log('Error fetching Products', err);
      })
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  // file based
  // Product.findById(prodId, product => {
  //   res.render('shop/product-detail', {
  //     product: product,
  //     pageTitle: product.title,
  //     path: '/products'
  //   });
  // });

  //   Product.findById(prodId)
  //     .then(product => {
  //       res.render('shop/product-detail', {
  //         product: product,
  //         pageTitle: product.title,
  //         path: '/products'
  //       });
  //     })
  //     .catch(err => {
  //       console.log(err);
  //     });

   Product.findById(prodId)
       .then(product => {
         res.render('shop/product-detail', {
           product: product,
           pageTitle: product.title,
           path: '/products'
         });
       })
       .catch(err => {
         console.log(err);
       });
};

exports.getIndex = (req, res, next) => {
  // Product.fetchAll(products => {
  //   res.render('shop/index', {
  //     prods: products,
  //     pageTitle: 'Shop',
  //     path: '/'
  //   });
  // });

  // Product.fetchAll()
  //     .then(products => {
  //       res.render('shop/index', {
  //         prods: products,
  //         pageTitle: 'Shop',
  //         path: '/'
  //       });
  //     });

    Product.find()
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products'
            });
        })
        .catch(err => {
            console.log('Error fetching Products', err);
        })
};

exports.getCart = (req, res, next) => {
    // req.user.getCart()
    //     .then(cart => {
    //         res.render('shop/cart', {
    //           path: '/cart',
    //           pageTitle: 'Your Cart',
    //           products: cart
    //         });
    //     })
    //     .catch(err => console.log(err));

    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items;
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products
            });
        })
        .catch(err => console.log(err));

  // Cart.getCart((cart) => {
  //   Product.fetchAll((products) => {
  //     const cartProducts = [];
  //     for (product of products) {
  //       const cartProduct = cart.products.find(prod => prod.id === product.id);
  //       if (cartProduct) {
  //         cartProducts.push({
  //           productData: product,
  //           quantity: cartProduct.qty
  //         });
  //       }
  //     }
  //     res.render('shop/cart', {
  //       path: '/cart',
  //       pageTitle: 'Your Cart',
  //       products: cartProducts
  //     });
  //   });
  // });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  // Product.findById(prodId, product => {
  //   Cart.addProduct(prodId, product.price);
  // });
  // res.redirect('/cart');
  Product.findById(prodId)
      .then(product => {
        return req.user.addToCart(product);
      })
      .then(response => {
        res.redirect('/cart');
      });
};

exports.deleteCartItem = (req, res) => {
  // const prodId = req.body.productId;
  // Product.findById(prodId, product => {
  //   Cart.deleteProduct(prodId, product.price);
  //
  //   res.redirect('/cart');
  // });
    const prodId = req.body.productId;

    req.user.deleteItemFromCart(prodId)
        .then(response => {
            res.redirect('/cart');
        })
};

exports.getOrders = (req, res, next) => {
  // res.render('shop/orders', {
  //   path: '/orders',
  //   pageTitle: 'Your Orders'
  // });
    // mongo db
  //   req.user
  //       .getOrders()
  //       .then(orders => {
  //           console.log(orders, 'orders');
  //           res.render('shop/orders', {
  //               path: '/orders',
  //               pageTitle: 'Your Orders',
  //               orders: orders
  //           });
  //       })
  //       .catch(err => console.log(err));
    Order.find({'user.userId': req.user._id})
        .then(orders => {
            res.render('shop/orders', {
              path: '/orders',
              pageTitle: 'Your Orders',
              orders: orders
            });
        });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};

exports.postOrders = (req, res) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(item => {
                return {
                    quantity: item.quantity,
                    product: { ...item.productId ._doc}
                }
            })

            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: products
            });

            return order.save();
        })
        .then(() => {
            return req.user.clearCart();
        })
        .then(response => {
            res.redirect('/orders');
        });

  // req.user.addOrder()
  //     .then(response => {
  //         res.redirect('/orders');
  //     })
}
