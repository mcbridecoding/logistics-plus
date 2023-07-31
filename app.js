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
    salesRep: String,
    customer: Boolean,
    carrier: Boolean,
    shipper: Boolean,
    consignee: Boolean,
    broker: Boolean
});

const orderSchema = new mongoose.Schema({
    quoteTaker: String,
    freightSize: String,
    shipmentType: String,
    quoteDate: Object,
    client: Object,
    quoteNumber: String,
    bolNumber: String,
    paymentTerms: String,
    thirdPartyInformation: String,
    shipper: Object,
    genericShipper: Object,
    consignee: Object,
    genericConsignee: Object,
    broker: Object,
    equipmentRequired: Object,
    freightReady: String,
    serviceLevel: String,
    deliveryEta: String,
    pickupAppointment: String,
    deliveryAppointment: String,
    shipmentDims: Object,
    dryTemp: String,
    temperature: String,
    commodity: String,
    totalPieces: String,
    totalWeight: Object,
    stackable: String,
    tarp: Boolean,
    tailgate: Boolean,
    teamRequired: Boolean,
    referenceNumbers: Object,
    dangerousGoods: Object,
    carrierDetails: Object,
    loadConfirmationSent: Object,
    bolSent: Object,
    commercialInvoiceSent: Object,
    tracingNotes: String,
    customerPricing: Object,
    carrierPricing: Object,
    brokerPricing: Object
});

const AddressBook = new mongoose.model('Address', addressBookSchema);

const Order = new mongoose.model('Order', orderSchema);

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function dateStringFormat(format) {
    if (format <= 9) {
        return '0' + format 
    } else return format
}

async function addNewAddress(req) {
    const newClient = {};
    const newShipper = {};
    const newConsignee = {};
    
    const newAddress = {
        newClient: newClient,
        newShipper: newShipper,
        newConsignee: newConsignee
    }

    if (req.body.client === 'new') {
        var newClientCustomer = false;
        var newClientCarrier = false;
        var newClientShipper = false;
        var newClientConsignee = false;
        var newClientBroker = false;
        
        if (req.body.newClientCustomer === 'on') {
            newClientCustomer = true;
        }

        if (req.body.newClientCarrier === 'on') {
            newClientCarrier = true;
        } 
        
        if (req.body.newClientShipper === 'on') {
            newClientShipper = true;
        }

        if (req.body.newClientConsignee === 'on') {
            newClientConsignee = true;
        } 

        if (req.body.newClientBroker === 'on') {
            newClientBroker = true;  
        } 
        
        const newClientaddress = new AddressBook({
            company: req.body.newClientCompany,
            attention: req.body.newClientAttention,
            addressOne: req.body.newClientAddressOne,
            addressTwo: req.body.newClientAddressTwo,
            city: req.body.newClientCity,
            state: req.body.newClientState,
            postal: req.body.newClientPostal,
            country: req.body.newClientCountry,
            phone: req.body.newClientPhone,
            fax: req.body.newClientFax,
            email: req.body.newClientEmail,
            salesRep: req.body.newClientSalesRep,
            customer: newClientCustomer,
            carrier: newClientCarrier,
            shipper: newClientShipper,
            consignee: newClientConsignee,
            broker: newClientBroker
        });
        newClientaddress.save(); 
        
        newClient.id = String(newClientaddress._id);
        newClient.company = req.body.newClientCompany    
    } else {
        newClient.id = req.body.client
        let clientName = await AddressBook.findOne({ _id: req.body.client });
        newClient.company = clientName.company;
    }

    if (req.body.shipper === 'new') {
        if (req.body.shipperSameAsClient === 'on') {
            newShipper.id = newClient.id;
            newShipper.company = newClient.company;                
        } else {
            var newShipperCustomer = false;
            var newShipperCarrier = false;
            var newShipperShipper = false;
            var newShipperConsignee = false;
            var newShipperBroker = false;
            
            if (req.body.newShipperCustomer === 'on') {
                newShipperCustomer = true;
            }

            if (req.body.newShipperCarrier === 'on') {
                newShipperCarrier = true;
            } 
            
            if (req.body.newShipperShipper === 'on') {
                newShipperShipper = true;
            }

            if (req.body.newShipperConsignee === 'on') {
                newShipperConsignee = true;
            } 
 
            if (req.body.newShipperBroker === 'on') {
                newShipperBroker = true;  
            } 
            
            const shipperAddress = new AddressBook({
                company: req.body.newShipperCompany,
                attention: req.body.newShipperAttention,
                addressOne: req.body.newShipperAddressOne,
                addressTwo: req.body.newShipperAddressTwo,
                city: req.body.newShipperCity,
                state: req.body.newShipperState,
                postal: req.body.newShipperPostal,
                country: req.body.newShipperCountry,
                phone: req.body.newShipperPhone,
                fax: req.body.newShipperFax,
                email: req.body.newShipperEmail,
                salesRep: req.body.newShipperSalesRep,
                customer: newShipperCustomer,
                carrier: newShipperCarrier,
                shipper: newShipperShipper,
                consignee: newShipperConsignee,
                broker: newShipperBroker
            });
            shipperAddress.save(); 
            
            newShipper.id = String(shipperAddress._id);
            newShipper.company = req.body.newShipperCompany; 
        }
    } else if (req.body.shipper === '') {
        newShipper.id = '',
        newShipper.company = ''
    } else {
        newShipper.id = req.body.shipper;
        let shipperName = await AddressBook.findOne({ _id: req.body.shipper });
        newShipper.company = shipperName.company;
    }

    if (req.body.consignee === 'new') {
        if (req.body.consigneeSameAsClient === 'on') {
            newConsignee.id = newClient.id;
            newConsignee.company = newClient.company;                
        } else {
            var newConsigneeCustomer = false;
            var newConsigneeCarrier = false;
            var newConsigneeShipper = false;
            var newConsigneeConsignee = false;
            var newConsigneeBroker = false;
            
            if (req.body.newConsigneeCustomer === 'on') {
                newConsigneeCustomer = true;
            }

            if (req.body.newConsigneeCarrier === 'on') {
                newConsigneeCarrier = true;
            } 
            
            if (req.body.newConsigneeShipper === 'on') {
                newConsigneeShipper = true;
            }

            if (req.body.newConsigneeConsignee === 'on') {
                newConsigneeConsignee = true;
            } 
 
            if (req.body.newConsigneeBroker === 'on') {
                newConsigneeBroker = true;  
            } 
            
            const consigneeAddress = new AddressBook({
                company: req.body.newConsigneeCompany,
                attention: req.body.newConsigneeAttention,
                addressOne: req.body.newConsigneeAddressOne,
                addressTwo: req.body.newConsigneeAddressTwo,
                city: req.body.newConsigneeCity,
                state: req.body.newConsigneeState,
                postal: req.body.newConsigneePostal,
                country: req.body.newConsigneeCountry,
                phone: req.body.newConsigneePhone,
                fax: req.body.newConsigneeFax,
                email: req.body.newConsigneeEmail,
                salesRep: req.body.newConsigneeSalesRep,
                customer: newConsigneeCustomer,
                carrier: newConsigneeCarrier,
                shipper: newConsigneeShipper,
                consignee: newConsigneeConsignee,
                broker: newConsigneeBroker
            });
            consigneeAddress.save(); 
            
            newConsignee.id = String(consigneeAddress._id);
            newConsignee.company = req.body.newConsigneeCompany 
        }
    } else if (req.body.consignee === '') {
        newConsignee.id = '',
        newConsignee.company = ''
    }else {
        newConsignee.id = req.body.consignee;
        let consigneeName = await AddressBook.findOne({ _id: req.body.consignee });
        newConsignee.company = consigneeName.company;
    }

    return newAddress
}

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

        const perPage = 10;
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
                salesRep: req.body.salesRep,
                customer: customer,
                carrier: carrier,
                shipper: shipper,
                consignee: consignee,
                broker: broker
            });
            newAddress.save();
            res.redirect('/address-book');
        });

app.route('/address-book/edit-address')
        .post((req, res) => {
            const addressId = req.body.addressId;
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

            AddressBook.findByIdAndUpdate(addressId, {
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
                salesRep: req.body.salesRep,
                customer: customer,
                carrier: carrier,
                shipper: shipper,
                consignee: consignee,
                broker: broker
            }, (err, docs) => {
                if (err) {
                    console.log(`Error: ${err}`);
                } else {
                    console.log(docs);
                }
                res.redirect(`/customer-card/id=${addressId}`);
            })

        });

app.route('/address-book/delete-address-id=:id')
        .get((req, res) => {
            const addressId = req.params.id;

            const message = {
                messageText: 'Contact Removed Successfully!',
                page: 'Address Book',
                link: '/address-book'
            }

            AddressBook.findByIdAndRemove(addressId, (err) => {
                if (!err) {
                    console.log(`Successfully Delete ${addressId}`);
                    res.render('success', { message: message });
                } else {
                    console.log(`Error: ${err}`);
                }
            });
        });

app.route('/customer-card/id=:id')
        .get(async(req, res) => {
            const addressId = req.params.id;

            const showAll = false;

            const contact = await AddressBook.findOne({ _id: addressId });

            const perPage = 10;
            const total = await Order.find({ 'client.id': addressId });
            const pages = Math.ceil(total.length / perPage);
            const pageNumber = (req.query.page == null) ? 1 : req.query.page;
            const startFrom = (pageNumber - 1) * perPage;

            const query = Order.find({ 'client.id': addressId })
            .sort({ 'quoteDate.date': 1 })
            .skip(startFrom)
            .limit(perPage);
            
            query.exec((err, orders) => {
                if (!err) {
                    res.render('customer-card', { 
                        contact: contact,
                        showAll: showAll,
                        pages: pages,
                        pageNumber: pageNumber,
                        orders: orders
                    });
                } else {
                    console.log(err);
                }
            });
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
                console.log(`Successfully Deleted ${userId}`);
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

        const searchQuery = {}

        searchQuery[searchFilter] = {$regex: '.*' + searchValue + '.*' };

        const showAll = true;

        const perPage = 25;
        const total = await AddressBook.find({});
        const pages = Math.ceil(total.length / perPage);
        const pageNumber = (req.query.page == null) ? 1 : req.query.page;
        const startFrom = (pageNumber - 1) * perPage;

        const query = AddressBook.find(searchQuery)
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
                console.log(`Error: ${err}`)
            }
        });
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

app.route('/orders')
    .get((req, res) => {
        res.render('orders', {});
    });

app.route('/orders/new-order')
    .get(async(req, res) => {
        const date = new Date();
        const todayDate = `${date.getFullYear()}-${dateStringFormat(date.getUTCMonth() +1)}-${dateStringFormat(date.getUTCDate())}`
        
        const addressList = await AddressBook.find({}).sort({ company: 1} );
        
        res.render('new-order', {
            todayDate: todayDate,
            addressList: addressList
        });
    })
    .post(async(req,res) => {
        const addressInformation = await addNewAddress(req);
        
        var dv = false;
        var rf = false;
        var du = false;
        var fd = false;
        var sd = false;
        var sb = false;
        var dd = false;
        var fu = false;
        var rl = false;
        
        if (req.body.dv === 'on') {
            dv = true;
        }
        if (req.body.rf === 'on') {
            rf = true;
        }
        if (req.body.du === 'on') {
            du = true;
        }
        if (req.body.fd === 'on') {
            fd = true;
        }
        if (req.body.sd === 'on') {
            sd = true;
        }
        if (req.body.sb === 'on') {
            sb = true;
        }
        if (req.body.dd === 'on') {
            dd = true;
        }
        if (req.body.fu === 'on') {
            fu = true;
        }
        if (req.body.rl === 'on') {
            rl = true;
        }

        const newJob = new Order({
            quoteTaker: req.body.quoteTaker,
            freightSize: req.body.freightSize,
            shipmentType: req.body.shipmentType,
            quoteDate: {
                date: req.body.quoteDate,
                time: req.body.quoteTime
            },
            client: {
                id: addressInformation.newClient.id,
                company: addressInformation.newClient.company
            },
            quoteNumber: req.body.quoteNumber,
            paymentTerms: req.body.paymentTerms,
            thirdPartyInformation: req.body.thirdPartyInformation,
            shipper: {
                id: addressInformation.newShipper.id,
                company: addressInformation.newShipper.company
            },
            genericShipper: {
                city: req.body.genericShipperCity,
                state: req.body.genericShipperState,
                country: req.body.genericShipperCountry
            },
            consignee: {
                id: addressInformation.newConsignee.id,
                company: addressInformation.newConsignee.company
            },
            genericConsignee: {
                city: req.body.genericConsigneeCity,
                state: req.body.genericConsigneeState,
                country: req.body.genericConsigneeCountry
            },
            broker: {
                sb: req.body.sbBroker,
                nb: req.body.nbBroker
            },
            equipmentRequired: {
                dv: dv,
                rf: rf,
                du: du,
                fd: fd,
                sd: sd,
                sb: sb,
                dd: dd,
                fu: fu,
                rl: rl
            },
            freightReady: req.body.freightReadyDate,
            serviceLevel: req.body.serviceLevel,
            deliveryEta: req.body.deliveryEta,
            pickupAppointment: req.body.pickupAppointment, 
            deliveryAppointment: req.body.deliveryAppointment,
            shipmentDims: {
                row1: {
                    l: req.body.l1,
                    w: req.body.w1,
                    h: req.body.h1,
                    c: req.body.c1,
                    cf: req.body.cf1,
                },
                row2: {                   
                    l: req.body.l2,
                    w: req.body.w2,
                    h: req.body.h2,
                    c: req.body.c2,
                    cf: req.body.cf2,
                },
                row3: {
                    l: req.body.l3,
                    w: req.body.w3,
                    h: req.body.h3,
                    c: req.body.c3,
                    cf: req.body.cf3,
                },
                row4: {
                    l: req.body.l4,
                    w: req.body.w4,
                    h: req.body.h4,
                    c: req.body.c4,
                    cf: req.body.cf4,
                },
                row5: {
                    l: req.body.l5,
                    w: req.body.w5,
                    h: req.body.h5,
                    c: req.body.c5,
                    cf: req.body.cf5,
                },
                row6: {
                    l: req.body.l6,
                    w: req.body.w6,
                    h: req.body.h6,
                    c: req.body.c6,
                    cf: req.body.cf6,
                },
                row7: {
                    l: req.body.l7,
                    w: req.body.w7,
                    h: req.body.h7,
                    c: req.body.c7,
                    cf: req.body.cf7,
                },
                row8: {
                    l: req.body.l8,
                    w: req.body.w8,
                    h: req.body.h8,
                    c: req.body.c8,
                    cf: req.body.cf8,
                },
                row9: {
                    l: req.body.l9,
                    w: req.body.w9,
                    h: req.body.h9,
                    c: req.body.c9,
                    cf: req.body.cf9,
                },
                row10: {
                    l: req.body.l10,
                    w: req.body.w10,
                    h: req.body.h10,
                    c: req.body.c10,
                    cf: req.body.cf10,
                },
                totalCuft: req.body.totalCUFT
            },
            dryTemp: req.body.dryTemp,
            temperature: req.body.temperature,
            commodity: req.body.commodity,
            totalPieces: req.body.totalPieces,
            totalWeight: {
                weight: req.body.totalWeight,
                measurement: req.body.weightMeasurement
            },
            stackable: req.body.stackable,
            tarp: req.body.tarp,
            tailgate: req.body.tailgate,
            teamRequired: req.body.teamRequired,
            referenceNumbers: {
                poNumber: req.body.poNumber,
                soNumber: req.body.invNumber,
                refNumber: req.body.refNumber,
                invNumber: req.body.invNumber
            },
            dangerousGoods: {
                un: req.body.un,
                class: req.body.class,
                pg: req.body.pg,
                dgDescription: req.body.dgDescription,
                emergencyContact: req.body.emergencyContact
            },
        }); 
        newJob.save();
        res.redirect(`/orders/view-order-id=${newJob._id}`);   
    });

app.route('/orders/view-order-id=:id')
    .get(async(req, res) => {
        const orderId = req.params.id;
        const addressList = await AddressBook.find({});
        
        Order.findOne({ _id: orderId }, (err, order) => {
            if (!err) {
                res.render('view-order', {
                    order: order,
                    addressList: addressList
                })
            } else {
                console.log(`Error: ${err}`);
            }
        });
    });

let port = process.env.PORT;
if (port == null || port == '') {
    port = 3000;
}

app.listen(port || 3000, () => {
    console.log('Server Started on port ' + port);
});
