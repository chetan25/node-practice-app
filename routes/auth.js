const express = require('express');
const router = express.Router();
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);
router.post(
    '/signup',
    [
        check('email')
            .isEmail()
            .withMessage('Email is invalid')
            .custom((value, { req }) => {
                // custom error validator
                // if (value === 'test') {
                //     // can return false or throw error
                //     throw new Error('Wrong Value');
                // }
                // return true;

                // express validator checks for the boolean or a promise and waits for the promise to be completed
                return User.findOne({email: value})
                    .then(userDoc => {
                        if (userDoc) {
                           return Promise.reject('E-Mail exists already, please pick a different one.');
                        }
                    });
            })
            .normalizeEmail(),
        body('password', 'Please enter a password that is at least 5 characters long') // this message will be used by all validator
            .isLength({min: 5})
            .isAlphanumeric()
            .trim(),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords have to match');
                }
                return true;
            })
    ],
    authController.postSignup
);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

router.get('/reset/:token',  authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;