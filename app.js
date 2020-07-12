// const routes = require('./routes');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error')

// const mongoConnect = require('./util/database').mongoConnect;
// const User = require('./mongo-models/user');
const User = require('./models/user');
// const server = http.createServer(routes);
// server.listen(3000);

const mongoose = require('mongoose');

const app = express();

const csrfProtection = csrf();

const mongodbUri = 'mongodb+srv://myadmin:NW4aX1rgTWzASVLG@cluster0-topzy.mongodb.net/shop';
// ?retryWrites=true&w=majority
// session store
const store = new MongoDbStore({
    uri: mongodbUri,
    collection: 'sessions'
});

// set global config items
app.set('view engine', 'ejs');
app.set('views', 'views');

// app.use((req, res, next) => {
//     console.log('in middleware');
//     next();//this allows request to continue to next middleware in line
// });

app.use(bodyParser.urlencoded({extended:  false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'my secret key',
    resave: false,
    saveUninitialized: false,
    store: store
}));

app.use(csrfProtection);
app.use(flash());

// this is adding the common values to every request
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();

    next();
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            console.log('user');
            // req.user = new User(user.name, user.email, user.cart, user._id);

            // mongoose model
            req.user = user;
            next();
        })
        .catch(err => {
            console.log(err);
            throw new Error(err);
        });
    // next();
});

// adding routes middleware
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// catch all route
// app.use((req, res) => {
//    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
// });

app.get('/500', errorController.get500);

app.use(errorController.get404);


app.use((error, req, res, next) => {
    res.redirect('/500');
});


// setting server
// app.listen(3000);

// without mongoose, manual connection to mongodb
// mongoConnect(() => {
//     app.listen(3000);
// });

// with mongoose
mongoose.connect(mongodbUri)
    .then(response => {
        // const user = new User({
        //     name: 'Test',
        //     email: 'test@gmail.com',
        //     cart: {
        //         item: []
        //     }
        // });
        // user.save();
        console.log('Server running at 3000');
        app.listen(3000);
    })
    .catch(err => {
        console.log('Error connecting to DB', err);
    });
