const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended:true }));
app.use(express.static('public'));

app.use(session({
    secret: 'Property of McBride Coding.',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://127.0.0.1:27017/logistics');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    lastSignIn: String,
});

const addressBookSchema = new mongoose.Schema({
    company: String,
    attention: String,
    addressOne: String,
    addressTwo: String,
    city: String,
    state: String,
    postal: String,
    country: String,
    phone: String,
    fax: String,
    email: String,
    customer: Boolean,
    carrier: Boolean,
    shipper: Boolean,
    consignee: Boolean,
    broker: Boolean
});

const AddressBook = new mongoose.model('Address', addressBookSchema);

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.route('/')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            res.render('home', {});
        } else {
            res.redirect('/login');
        }
    });

app.route('/add-user')
    .post((req, res) => {
        const message = {
            messageText: 'User Added Successfully!',
            page: 'Settings',
            link: '/settings'
        }
        
        User.register({ username: req.body.username }, req.body.password, (err, user) => {
            if (err) { 
                console.log(err);
                res.redirect('/settings');
            } else {
                passport.authenticate('local')(req, res, () => {
                    res.render('success', {message: message});                   
                });
            }
            });
        }); 

app.route('/address-book')
        .get(async (req, res) => {
            const showAll = false;

            const perPage = 25;
            const total = await AddressBook.find({});
            const pages = Math.ceil(total.length / perPage);
            const pageNumber = (req.query.page == null) ? 1 : req.query.page;
            const startFrom = (pageNumber - 1) * perPage;

            const query = AddressBook.find({})
                .sort({ company: 1 })
                .skip(startFrom)
                .limit(perPage);
            
            query.exec((err, addresses) => {
                if (!err) {
                    res.render('address-book', {
                        addresses: addresses,
                        showAll: showAll,
                        pages: pages,
                        pageNumber: pageNumber
                    });
                } else {
                    console.log(err);
                }
            }); 
        });

app.route('/address-book/add-address')
        .post((req, res) => {            
            var customer = false;
            var carrier = false;
            var shipper = false;
            var consignee = false;
            var broker = false;
            
            if (req.body.customer === 'on') {
                customer = true;
            }

            if (req.body.carrier === 'on') {
                carrier = true;
            } 
            
            if (req.body.shipper === 'on') {
                shipper = true;
            }

            if (req.body.consignee === 'on') {
                consignee = true;
            } 
 
            if (req.body.broker === 'on') {
                broker = true;  
            } 
            
            const newAddress = new AddressBook({
                company: req.body.company,
                attention: req.body.attention,
                addressOne: req.body.addressOne,
                addressTwo: req.body.addressTwo,
                city: req.body.city,
                state: req.body.state,
                postal: req.body.postal,
                country: req.body.country,
                phone: req.body.phone,
                fax: req.body.fax,
                email: req.body.email,
                customer: customer,
                carrier: carrier,
                shipper: shipper,
                consignee: consignee,
                broker: broker
            });
            newAddress.save();
            res.redirect('/address-book');
        });

app.route('/delete-user/id=:id')
    .get((req, res) => {
        const userId = req.params.id;

        const message = {
            messageText: 'User Removed Successfully!',
            page: 'Settings',
            link: '/settings'
        }

        User.findByIdAndRemove(userId, (err) => {
            if (!err) {
                console.log('Successfully Deleted ' + userId);
                res.render('success', { message: message });
            } else {
                console.log('Error: ' + err);
            }
        });
    });

app.route('/login')
    .get((req, res) => {
        res.render('login');
    })
    .post((req, res) => {
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });

        const date = new Date();

        var time = new Date(date).toLocaleString("en-US", {
            localeMatcher: "best fit",
            timeZoneName: "short"
          });

        req.login(user, (err) => {
            if (err) {
                res.redirect('/login');
            } else {
                User.findOneAndUpdate({username: user.username}, { lastSignIn: `${time}` }, (err, docs) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(docs);
                    }
                });
                
                passport.authenticate('local')(req, res,  () => {
                    res.redirect('/')
                });
            }
        });
    });

app.route('/logout')
    .get((req, res) => {
        req.logOut(err => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/login')
            }
        });
    });

app.route('/search-user')
    .post((req, res) => {
        const username = req.body.username.toLowerCase();
        const showAll = true;
        User.find({ username: username }, (err, user) => {
            if (!err) {
                res.render('settings', { 
                    users: user,
                    showAll: showAll,
                    userId: username
                });
            } else {
                console.log('Error' + err);
            }
        });
    });

app.route('/search-address-book')
    .post(async(req, res) => {
        const searchValue = req.body.searchValue;
        const searchFilter = req.body.searchFilter;

        const showAll = true;

        const perPage = 25;
        const total = await AddressBook.find({});
        const pages = Math.ceil(total.length / perPage);
        const pageNumber = (req.query.page == null) ? 1 : req.query.page;
        const startFrom = (pageNumber - 1) * perPage;
        
        if (searchFilter === 'city') {
            const query = AddressBook.find( { city: { $regex: '.*' + searchValue + '.*' } })
            .sort({ company: 1 })
            .skip(startFrom)
            .limit(perPage);
        
        query.exec((err, addresses) => {
            if (!err) {
                res.render('address-book', {
                    addresses: addresses,
                    showAll: showAll,
                    pages: pages,
                    pageNumber: pageNumber,
                    searchFilter: searchFilter,
                    searchValue: searchValue
                });
            } else {
                console.log(err);
            }
        });
        } else if (searchFilter === 'state') {
            const query = AddressBook.find( { state: { $regex: '.*' + searchValue + '.*' } })
            .sort({ company: 1 })
            .skip(startFrom)
            .limit(perPage);
        
        query.exec((err, addresses) => {
            if (!err) {
                res.render('address-book', {
                    addresses: addresses,
                    showAll: showAll,
                    pages: pages,
                    pageNumber: pageNumber,
                    searchFilter: searchFilter,
                    searchValue: searchValue
                });
            } else {
                console.log(err);
            }
        });
        } else {
            const query = AddressBook.find( { company: { $regex: '.*' + searchValue + '.*' } })
            .sort({ company: 1 })
            .skip(startFrom)
            .limit(perPage);
        
        query.exec((err, addresses) => {
            if (!err) {
                res.render('address-book', {
                    addresses: addresses,
                    showAll: showAll,
                    pages: pages,
                    pageNumber: pageNumber,
                    searchFilter: searchFilter,
                    searchValue: searchValue
                });
            } else {
                console.log(err);
            }
        });
        }
    });

app.route('/settings')
    .get((req, res) => {
        const userQuery = User.find({}).sort({ username: 1 });
        const showAll = false;
        const username = '';
        userQuery.exec((err, users) => {
            if (!err) {
                res.render('settings', {
                    users: users,
                    showAll: showAll,
                    userId: username
                });
            } else {
                console.log(err);
            }
        })
    });

app.route('/success')
    .get((req, res) => {
        const message = {
            messageText: '',
            page: '',
            link: ''
        }
        res.render('success', {message: message});
    });

app.route('/quotes')
    .get((req, res) => {
        res.render('quotes', {});
    });

app.route('/quotes/new-quote')
    .get((req, res) => {
        res.render('new-quote', {});
    });

let port = process.env.PORT;
if (port == null || port == '') {
    port = 3000;
}

app.listen(port || 3000, () => {
    console.log('Server Started on port ' + port);
});
