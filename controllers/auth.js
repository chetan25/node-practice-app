const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator/check');

//mail
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');

const transport = nodemailer.createTransport(sendGridTransport({
    auth: {
        api_key: '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'
    }
}));

exports.getLogin = (req, res) => {
    // console.log(req.get('Cookie'))
    // const isLoggedIn = req.get('Cookie')
    //     .split(';')[1]
    //     .trim()
    //     .split`  ('=')[1] === 'true';

    // console.log(req.session.isLoggedIn);
    const errorMessage = req.flash('error');
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: errorMessage.length > 0 ? errorMessage : null
    });
}

exports.postLogin = (req, res) => {
    // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly')
    // req.session.isLoggedIn = true;
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email: email})
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid Email or Password.');
                return res.redirect('/login');
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if(!doMatch) {
                        return res.redirect('/login');
                    }
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save((err) => {
                        console.log(err);
                        res.redirect('/');
                    });
                })
                .catch(err => {
                    return res.redirect('/login');
                });
        })
        .catch(err => {
            console.log(err);
        })
}

exports.postLogout = (req, res) => {
    req.session.destroy((err) => {
       console.log(err);
       res.redirect('/');
    });
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);
    if (password !== confirmPassword || !errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg
        });
    }
    User.findOne({email: email})
        .then(userDoc => {
            if (userDoc) {
                return res.redirect('/')
            }
            return bcrypt.hash(password, 12)
                .then(hashPassword => {
                    const user = new User({
                        email: email,
                        password: hashPassword,
                        cart: {items: []}
                    });
                    return user.save();
                })
                .then(() => {
                    res.redirect('/login');
                    // returns a promise
                    return transport.sendMail({
                       to: email,
                       from: 'chetandasauni25@gmail.com',
                       subject: 'Signup Completed',
                       html: '<h1>You successfully signed up</h1>'
                    });
                });
        })
        .catch(err => console.log(err))
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup'
    });
};


exports.getReset = (req, res) => {
    const errorMessage = req.flash('error');
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: errorMessage.length > 0 ? errorMessage : null
    });
}

exports.postReset = (req, res) => {
    crypto.randomBytes(32, (err, buffer) => {
        if(err) {
            res.redirect('/reset');
        }

        const token = buffer.toString('hex')
        const email = req.body.email;
        User.findOne({email: email})
            .then(user => {
                if (!user) {
                    res.flash('error', 'No Account found');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExp = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                res.redirect('/');
                return transport.sendMail({
                    to: email,
                    from: 'chetandasauni25@gmail.com',
                    subject: 'Password Reset',
                    html: `
                      <p>You requested a password reset</p>
                      <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to reset</p>
                    `
                });
            })
            .catch(err => console.log(err));
    });
}

exports.getNewPassword = (req, res) => {
    const errorMessage = req.flash('error');
    const token = req.params.token;
    console.log(token);
    User.findOne({resetToken: token, resetTokenExp: {$gt: Date.now()}})
        .then(user => {
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'Reset Password',
                userId: user._id.toString(),
                passwordToken: token,
                errorMessage: errorMessage.length ? errorMessage : null
            });
        })
        .catch(err => console.log(err));
}

exports.postNewPassword = (req, res) => {
  const userId = req.body.userId;
  const password = req.body.password;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({_id: userId, resetToken: passwordToken, resetTokenExp: {$gt: Date.now()}})
      .then(user => {
          if (!user) {
              return res.redirect('/login');
          }
          resetUser = user;
          return bcrypt.hash(password, 12);
      })
      .then(hashPassword => {
          resetUser.password = hashPassword;
          resetUser.resetToken = undefined;
          resetUser.resetTokenExp = undefined;

          return resetUser.save();
      })
      .then(result => {
          res.redirect('/login');
      })
      .catch(err => {
          console.log(err);
      })
}