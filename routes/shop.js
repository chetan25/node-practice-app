const express = require('express');
// const path = require('path');
const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);
router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.deleteCartItem);

// router.get('/checkout', shopController.getCheckout);

router.get('/orders', isAuth, shopController.getOrders);
router.post('/create-order', isAuth, shopController.postOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

router.get('/checkout', isAuth, shopController.geCheckout);
router.get('/checkout/success', shopController.getCheckoutSuccess);
router.get('/checkout/cancel', shopController.geCheckout);

module.exports = router;