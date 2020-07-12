const express = require('express');
const router = express.Router();
const { check } = require('express-validator/check');

const authController = require('../controllers/auth');


router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);
router.post(
    '/signup',
    check('email')
        .isEmail()
        .withMessage('Email is invalid')
        .custom((value, { req }) => {
            // custom error validator
           if (value === 'test') {
               // can return false or throw error
               throw new Error('Wrong Value');
           }
           return true;
        }),
    authController.postSignup
);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

router.get('/reset/:token',  authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;