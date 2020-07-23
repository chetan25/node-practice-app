// const Product = require('../mongo-models/product');
const Cart = require('../mongo-models/cart');
const fs = require('fs');
const path = require('path');
const stripe = require('stripe')('sk_test_cDX0c0gQBgKdWdsBeMqXBuVD00kB74s7fC');

const Product = require('../models/product');
const Order = require('../models/order');
const PDFDocument = require('pdfkit');

const itemsPerPage = 2;

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

  // Product.find()
  //     .then(products => {
  //         res.render('shop/product-list', {
  //           prods: products,
  //           pageTitle: 'All Products',
  //           path: '/products'
  //         });
  //     })
  //     .catch(err => {
  //         console.log('Error fetching Products', err);
  //     })

    let totalProducts = 0;
    const page = +req.query.page || 1;
    Product.find()
        .countDocuments()
        .then(numberOfProducts => {
            totalProducts = numberOfProducts;
            return Product.find()
                .skip((page -1) * itemsPerPage)
                .limit(itemsPerPage);
        })
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                totalProducts: totalProducts,
                currentPage: page,
                nextPage: page + 1,
                previousPage: page -1,
                lastPage: Math.ceil(totalProducts/itemsPerPage),
                hasNextPage: (itemsPerPage * page) < totalProducts,
                hasPreviousPage: page > 1,
                pageTitle: 'All Products',
                path: '/products'
            });
        })
        .catch(err => {
            console.log('Error fetching Products', err);
        });
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

    let totalProducts = 0;
    const page = +req.query.page || 1;
    Product.find()
        .countDocuments()
        .then(numberOfProducts => {
            totalProducts = numberOfProducts;
            return Product.find()
                .skip((page -1) * itemsPerPage)
                .limit(itemsPerPage);
        })
        .then(products => {
            res.render('shop/index', {
                prods: products,
                totalProducts: totalProducts,
                currentPage: page,
                nextPage: page + 1,
                previousPage: page -1,
                lastPage: Math.ceil(totalProducts/itemsPerPage),
                hasNextPage: (itemsPerPage * page) < totalProducts,
                hasPreviousPage: page > 1,
                pageTitle: 'Shop',
                path: '/'
            });
        })
        .catch(err => {
            console.log('Error fetching Products', err);
        });
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

exports.postOrders = (req, res) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(item => {
                return {
                    quantity: item.quantity,
                    product: {...item.productId._doc}
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

exports.getInvoice = (req, res, next) => {
   const orderId = req.params.orderId;
   Order.findById(orderId)
       .then(order => {
           if(!order) {
               return next(new Error('No order found'));
           }
           if (order.user.userId.toString() !== req.user._id.toString()) {
               return next(new Error('UnAutherize Action'));
           }
           const invoiceName = 'invoice-' + orderId + '.pdf';
           const invoicePath = path.join('data', 'invoices', invoiceName);
           // not optimal for bigger file, since node will read the file into memory,
           // we should be streaming data
           // fs.readFile(invoicePath, (err, data) => {
           //     if (err) {
           //         return next(err);
           //     }
           //     res.setHeader('Content-Type', 'application/pdf');
           //     // inline will open on same tab
           //     // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
           //     res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
           //     res.send(data);
           // });

           // read from a already created pdf
           // const file = fs.createReadStream(invoicePath);
           // res.setHeader('Content-Type', 'application/pdf');
           // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
           // // pipe readable stream to writable stream response
           // file.pipe(res);

           // create document
           const pdfDoc = new PDFDocument();
           res.setHeader('Content-Type', 'application/pdf');
           res.setHeader(
               'Content-Disposition',
               'inline; filename="' + invoiceName + '"'
           );
           pdfDoc.pipe(fs.createWriteStream(invoicePath));
           pdfDoc.pipe(res);
           // write to pdf
           pdfDoc.fontSize(26).text('Invoice', {
               underline: true
           });
           pdfDoc.text('-----------------------');
           let totalPrice = 0;
           order.products.forEach(prod => {
               totalPrice += (prod.product.price * prod.quantity);
               pdfDoc.fontSize(14)
                   .text(
                       prod.product.title +
                       ' - ' +
                       prod.quantity.toString() +
                       ' x ' +
                       '$' +
                  prod.product.price
              );
           });

           pdfDoc.text('--------------------');

           pdfDoc.fontSize(18).text('Total Price' + ' - $' + totalPrice);

           //calling this the writable stream will be close and the files will be saved
           pdfDoc.end();

       })
       .catch(err => {
           next(err);
       });
}

exports.geCheckout = (req, res, next) => {
    let products;
    let totalSum = 0;
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            products = user.cart.items;
            products.forEach(product => {
                totalSum += product.quantity * product.productId.price;
            });
            console.log('test');
            return stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: products.map(p => {
                    return {
                        name: p.productId.title,
                        description: p.productId.description,
                        amount: p.productId.price * 100,
                        currency: 'usd',
                        quantity: p.quantity
                    }
                }),
                success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
                cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
            });
        })
        .then(session => {
            res.render('shop/checkout', {
                path: '/checkout',
                pageTitle: 'Checkout',
                products: products,
                totalSum: totalSum,
                sessionId: session.id
            });
        })
        .catch(err => console.log(err));
}

exports.getCheckoutSuccess = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(item => {
                return {
                    quantity: item.quantity,
                    product: {...item.productId._doc}
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