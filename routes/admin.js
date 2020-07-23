const express = require('express');
// const path = require('path');
const router = express.Router();
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
// const rootDir = require('../util/path');

router.get('/add-product', isAuth, adminController.getAddProduct);
router.post('/add-product', isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post('/edit-product', isAuth, adminController.postEditProduct);

router.get('/products', isAuth, adminController.getProducts);

// router.post('/delete-product', isAuth, adminController.deleteProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);
// router.post('/product', (req, res) => {
//     const body = res.body;
//     const title = body.title;
//     products.push(title);
//     res.redirect('/');
// });

module.exports = router;
