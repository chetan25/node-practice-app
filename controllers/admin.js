// const Product = require('../mongo-models/product');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const userId = req.user._id;

  // Mongo manual
  // const product = new Product(title, price, description, imageUrl, null, userId);
  // product.save()
  //     .then(response => {
  //         res.redirect('/');
  //     })
  //     .catch(err => {
  //         console.log(err);
  //     })

    const product = new Product({
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
        userId: req.user
    });
    // this save comes from Mongoose
    product.save()
        .then(response => {
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
        })
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  // file based
  // Product.findById(prodId, product => {
  //   if (!product) {
  //     return res.redirect('/');
  //   }
  //   res.render('admin/edit-product', {
  //     pageTitle: 'Edit Product',
  //     path: '/admin/edit-product',
  //     editing: editMode,
  //     product: product
  //   });
  // });
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product
            });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.getProducts = (req, res, next) => {
    // MOngo db
  // Product.fetchAll()
  //   .then(products => {
  //       res.render('admin/products', {
  //           prods: products,
  //           pageTitle: 'Admin Products',
  //           path: '/admin/products'
  //       });
  //   });
  // file based
  // Product.fetchAll(products => {
  //   res.render('admin/products', {
  //     prods: products,
  //     pageTitle: 'Admin Products',
  //     path: '/admin/products'
  //   });
  // });

    Product.find({userId: req.user._id})
        // .select('title price -_id')
        // .populate('userId', 'name')
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(err => {
            console.log('Error fetching Products', err);
        })
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    // const userId = req.user._id;
    // const updatedProduct = new Product(prodId, title, imageUrl, description, price);
    // updatedProduct.save();
    Product.findById(prodId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            // product is a mongoose object
            product.title = title;
            product.imageUrl = imageUrl;
            product.description = description;
            product.price = price;

            return product.save()
                .then(product => {
                    res.redirect('/admin/products');
                });
        })
        .catch(err => {
            console.log(err);
        });
    // const product = new Product(
    //     title,
    //     price,
    //     description,
    //     imageUrl,
    //     prodId,
    //     userId
    // );
    // product.save()
    //     .then(product => {
    //         res.redirect('/admin/products');
    //     })
    //     .catch(err => {
    //         console.log(err);
    //     })
};

exports.deleteProduct = (req, res) => {
    const prodId = req.body.productId;
    // Product.deleteById(prodId)
    //     .then(() => {
    //         res.redirect('/admin/products');
    //     })
    //     .catch(err => {
    //         console.log('error in deleting');
    //     });
    Product.deleteOne({_id: prodId, userId: req.user._id})
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log('error in deleting');
        });
}