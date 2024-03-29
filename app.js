const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const crypto = require('crypto');
const pdfService = require('./public/javascript/pdfService');
const { name } = require('ejs');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended:true }));
app.use(express.static('public'));

mongoose.set('strictQuery', true);

app.use(session({
    secret: 'Property of McBride Coding.',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://127.0.0.1:27017/logistics');

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
    broker: Boolean,
    vendor: Boolean
});

const defaultSettingsSchema = new mongoose.Schema({
    owner: Object,
    purchasing: Object,
    invoicing: Object   
});

const inventorySchema = new mongoose.Schema({
    itemId: String,
    itemDescription: String,
    vendor: Array,
    unitOfMeasure: String,
    reOrderPoint: String,
    sellPrice: String,
    notes: String,
});

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: String,
    date: String,
    dueDate: String,
    terms: String,
    owner: Object,
    soldTo: Object,
    shipTo: Object,
    customerReference: String,
    orderStatus: Object,
    shipMethod: String,
    lineItems: Array,
    currency: String,
    invoiceTotal: String,
    discount: Number,
    notes: String,
})

const orderSchema = new mongoose.Schema({
    quoteTaker: String,
    freightSize: String,
    shipmentType: String,
    importExport: String,
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
    brokerPricing: Object,
    carrierRates: Array,
    notes: String
});

const purchasingSchema = new mongoose.Schema({
    purchaseOrderNumber: String,
    date: String,
    soldTo: Object,
    vendor: Object,
    shipTo: Object,
    paidVia: String,
    orderStatus: Object,
    shipMethod: String,
    lineItems: Array,
    currency: String,
    invoiceTotal: String,
    notes: String,
});

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    lastSignIn: String,
});

const AddressBook = new mongoose.model('Address', addressBookSchema);

const Default = new mongoose.model('Default', defaultSettingsSchema);

const Inventory = new mongoose.model('Item', inventorySchema);

const Invoice = new mongoose.model('Invoice', invoiceSchema)

const Order = new mongoose.model('Order', orderSchema);

const Purchasing = new mongoose.model('Purchase', purchasingSchema);

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
        var newClientVendor = false;
        
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

        if (req.body.newClientVendor === 'on') {
            newClientVendor = true;
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
            broker: newClientBroker,
            vendor: newClientVendor
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
            var newShipperVendor = false;
            
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

            if (req.body.newShipperVendor === 'on') {
                newShipperVendor = true;
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
                broker: newShipperBroker,
                vendor: newShipperVendor
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
            var newConsigneeVendor = false;
            
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

            if (req.body.newConsigneeVendor === 'on') {
                newConsigneeVendor = true;
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
                broker: newConsigneeBroker,
                vendor: newConsigneeVendor
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

function calculateNextOrder(previousNumber) {
    const nextOrder = previousNumber + 1;
    if (nextOrder < 9) {
        return '00' + String(nextOrder);
    } else if (nextOrder <= 10 || nextOrder <= 99){
        return '0' + String(nextOrder);
    } else return String(nextOrder); 
}

async function printInvoice(invoice, owner, soldTo, shipTo, taxes, res) {
    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment;filename=Invoice#${invoice.invoiceNumber}.pdf`  
    });

    pdfService.buildInvoice(
        (chunk) => stream.write(chunk),
        () => stream.end(),
        invoice,
        owner,
        soldTo,
        shipTo,
        taxes
    ); 
}

async function printPurchaseOrder(purchaseOrder, soldTo, vendor, shipTo, taxes, res) {    
    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment;filename=PO#${purchaseOrder.purchaseOrderNumber}.pdf`  
    });

    pdfService.buildPurchaseOrder(
        (chunk) => stream.write(chunk),
        () => stream.end(),
        purchaseOrder,
        soldTo,
        vendor,
        shipTo,
        taxes,
    );
}

async function printLogisticsCallSheet(quote, customer, shipper, consignee, res) {
    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment;filename=${quote.quoteNumber}-callsheet.pdf`  
    });

    pdfService.buildLogisticsCallSheet(
        (chunk) => stream.write(chunk),
        () => stream.end(),
        quote,
        customer,
        shipper, 
        consignee
    );
}

async function printCarrierRateSheet(quote, res) {
    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment;filename=${quote.quoteNumber}-carrier-rates.pdf`
    });

    pdfService.buildCarrierRateSheet(
        (chunk) => stream.write(chunk),
        () => stream.end(),
        quote
    );
}

async function findOwnerName(id) {
    const owner = await AddressBook.findOne({ _id: id });
    return owner.company;
}

async function findItemDetails(id) {
    const item = await Inventory.findOne({ _id: id });
    return item;
}

async function calculateInvoiceTotal(lineItems, discount, gstExempt) {    
    const subTotals = [];
    lineItems.forEach((item) => {
        subTotals.push(Number(item.lineTotal));
    });
    
    let subTotal = subTotals.reduce((a, b) => a + b, 0);
    const disc = subTotal * (Number(discount) / 100);
    subTotal = subTotal - disc;
    const pst = subTotal * (taxes.PST / 100);
    let gst = subTotal * (taxes.GST / 100);
    if (gstExempt) {
        gst = 0;
    }
    const total = subTotal + gst + pst;
    
    return total;
}

const taxes = {
    PST: process.env.PST,
    GST: process.env.GST
}

let currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CAD' });

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
        var vendor = false;
        
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
        
        if (req.body.vendor === 'on') {
            vendor = true;
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
            broker: broker,
            vendor: vendor
        });
        newAddress.save();
        res.redirect(`/customer-card/id=${newAddress._id}`);
    });

app.route('/address-book/edit-address')
    .post((req, res) => {
        const addressId = req.body.addressId;
        var customer = false;
        var carrier = false;
        var shipper = false;
        var consignee = false;
        var broker = false;
        var vendor = false;
        
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

        if (req.body.vendor === 'on') {
            vendor = true;
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
            broker: broker,
            vendor: vendor
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

app.route('/error')
    .get((req, res) => {
        const message = {
            messageText: '',
            page: '',
            link: ''
        }
        res.render('success', {message: message});
    });

app.route('/inventory/add-item')
    .post((req, res) => {
        const newItem = new Inventory({
            itemId: req.body.itemId,
            itemDescription: req.body.itemDescription,
            unitOfMeasure: req.body.uom,
            reOrderPoint: req.body.reOrderPoint,
            sellPrice: req.body.sellPrice,
            notes: req.body.itemNotes,
        });
        newItem.save();
        res.redirect(`/inventory/view-item-id=${newItem._id}`);
    });

app.route('/inventory/add-vendor')
    .post(async (req, res) => {
        const vendorName = await AddressBook.findOne({ _id: req.body.vendor });
        const vendor = {
            id: req.body.vendor,
            company: vendorName.company
        }

        Inventory.findOneAndUpdate({ _id: req.body.itemId }, {
            $push : { 
                vendor: {
                    _id: crypto.randomUUID(),
                    company: vendor,
                    itemId: req.body.vendorItemId,
                    cost: req.body.vendorItemCost,
                    currency: req.body.vendorItemCurrency,
                    url: req.body.url
                }
            }
        },(err, success) => { 
            if (!err) { 
                console.log(`${success}`);
                res.redirect(`/inventory/view-item-id=${req.body.itemId}`);
            } else { 
                console.log(`Error: ${err}`) 
            } 
        });
    });

app.route('/inventory/delete-item-id=:id')
    .get((req, res) => {
        const itemId = req.params.id;

        const message = {
            messageText: 'Item Removed Successfully!',
            page: 'Product Inquiry',
            link: '/warehousing'
        }

        Inventory.findByIdAndRemove(itemId, (err) => {
            if (!err) {
                console.log(`Successfully Deleted ${itemId}`);
                res.render('success', { message: message });
            } else {
                console.log('Error: ' + err);
            }
        });
    });

app.route('/inventory/item-id=:itemId/delete-vendor-id=:vendorId')
    .get(async (req, res) => {
        const itemId = req.params.itemId;
        const vendorId = req.params.vendorId;

        Inventory.findOneAndUpdate({ _id: itemId }, {
            $pull: {
                vendor: {
                    _id: vendorId
                }
            }
        }, (err, success) => {
            if (!err) { 
                console.log(`${success}`); 
                res.redirect(`/inventory/view-item-id=${itemId}`);
            } else {
                console.log(`Error: ${err}`);
            } 
        });
    });

app.route('/inventory/item-id=:itemId/edit-vendor-id=:vendorId')
    .post(async (req, res) => {
        const itemId = req.params.itemId;
        const vendorId = req.params.vendorId;

        const vendorName = await AddressBook.findOne({ _id: req.body.vendor });
        const vendor = {
            id: req.body.vendor,
            company: vendorName.company
        }

        Inventory.findOneAndUpdate({ 'vendor._id': vendorId }, {
            $set: {
                'vendor.$': {
                    _id: vendorId,
                    company: vendor,
                    itemId: req.body.vendorItemId,
                    cost: req.body.vendorItemCost,
                    currency: req.body.vendorItemCurrency,
                    url: req.body.url
                }
            }
        }, (err, success) => {
            if (!err) { 
                console.log(`${success}`); 
                res.redirect(`/inventory/view-item-id=${itemId}`);
            } else {
                console.log(`Error: ${err}`);
            } 
        });
    });

app.route('/inventory/search-:id')
    .post(async (req, res) => {
        const searchFilter = {}

        const vendors = await AddressBook.find({ vendor: true }).sort({ company: 1 });
        const inventoryList = await Inventory.find({}).sort({ itemId: 1 });

        if (req.params.id === 'vendor') {
            searchFilter['vendor.company.company'] = req.body.searchId;
        } else {
            searchFilter[req.params.id] = {$regex: '.*' + req.body.searchId + '.*'};
        }

        const perPage = 50;
        const total = await Inventory.find(searchFilter);
        const pages = Math.ceil(total.length / perPage);
        const pageNumber = (req.query.page == null) ? 1 : req.query.page;
        const startFrom = (pageNumber - 1) * perPage;

        const query = Inventory.find(searchFilter)
            .sort({ itemId: 1 })
            .skip(startFrom)
            .limit(perPage);
        
        query.exec((err, items) => {
            if (!err) {
                res.render('inventory-inquiry', {
                    items: items,
                    vendors: vendors,
                    inventoryList: inventoryList,
                    pages: pages,
                    pageNumber: pageNumber
                });
            } else {
                console.log(err);
            }
        }); 
    });

app.route('/inventory/edit-item')
    .post((req, res) => {
        const editId = req.body.editId;
        Inventory.findByIdAndUpdate(editId, {
            itemId: req.body.itemId,
            itemDescription: req.body.itemDescription,
            unitOfMeasure: req.body.uom,
            reOrderPoint: req.body.reOrderPoint,
            sellPrice: req.body.sellPrice,
            notes: req.body.itemNotes,
        }, (err, docs) => {
            if (err) {
                console.log(`Error: ${err}`);
            } else {
                console.log(docs);
            }
        });
        res.redirect(`/inventory/view-item-id=${editId}`);
    });

app.route('/inventory/view-item-id=:id')
    .get(async (req, res) => {
        const item = await Inventory.findOne({ _id: req.params.id });
        
        const vendorList = await AddressBook.find({ vendor: true }).sort({ company: 1 });
        const inventoryList = await Inventory.find({}).sort({ itemId: 1 });
        const vendors = await AddressBook.find({ vendor: true }).sort({ company: 1 });
        
        res.render('view-item', {
            item: item,
            vendorList: vendorList,
            inventoryList: inventoryList,
            vendors: vendors
        });
    });

app.route('/invoicing')
    .get(async (req, res) =>{
        const showAll = false;

        const perPage = 15;
        const total = await Invoice.find({ 'orderStatus.status': 'open' });
        const pages = Math.ceil(total.length / perPage);
        const pageNumber = (req.query.page == null) ? 1 : req.query.page;
        const startFrom = (pageNumber - 1) * perPage;

        const invoices = await Invoice.find({ 'orderStatus.status': 'open' }).sort({ invoiceNumber: 1 }).skip(startFrom).limit(perPage);
        
        res.render('invoicing', {
            showAll: showAll,
            pages: pages,
            pageNumber: pageNumber,
            invoices: invoices
        });
    });

app.route('/invoicing/delete-invoice')
    .post((req, res) => {
        const deleteIds = req.body.invoiceId;

        Invoice.deleteMany({ _id: deleteIds }, (err) => {
            if (!err) {
                console.log(`Successfully deleted item(s)`);
                res.redirect('/invoicing');
            } else {
                console.log(`Error: ${err}`);
            }
        });
    });

app.route('/invoicing/edit-invoice/id=:id')
    .post(async (req, res) => {
        const editId = req.params.id;
        const soldToCompany = await findOwnerName(req.body.soldTo); 
        const shipToCompany = await findOwnerName(req.body.shipTo);

        const soldTo = {
            id: req.body.soldTo,
            company: soldToCompany
        }
        
        const shipTo = {
            id: req.body.shipTo,
            company: shipToCompany
        }

        const lineTotals = await Invoice.findOne({ _id: editId });

        const lineTotal = await calculateInvoiceTotal(lineTotals.lineItems, lineTotals.discount, true);

        const invoiceTotal = currency.format(lineTotal).slice(2);

        Invoice.findByIdAndUpdate(editId, {
            date: req.body.date,
            dueDate: req.body.dueDate,
            terms: req.body.terms,
            soldTo: soldTo,
            shipTo: shipTo,
            shipMethod: req.body.shipMethod,
            currency: req.body.currency,
            notes: req.body.notes,
            discount: req.body.discount,
            invoiceTotal: invoiceTotal,
        }, (err, docs) => {
            if (err) {
                console.log(err);
            } else {
                console.log(docs);
                res.redirect(`/invoicing`);
            }
        });
    });

app.route('/invoicing/new-order')
    .get(async (req, res) => {
        const date = new Date();
        const todayDate = `${date.getFullYear()}-${dateStringFormat(date.getUTCMonth() +1)}-${dateStringFormat(date.getUTCDate())}`
        let dueDate = new Date();
        dueDate.setDate(date.getDate() + 30);
        dueDate = `${dueDate.getFullYear()}-${dateStringFormat(dueDate.getUTCMonth() +1)}-${dateStringFormat(dueDate.getUTCDate())}`

        let nextInvoiceNumber = '';

        let invoiceOrderQuery = await Invoice.find({}).sort({ invoiceNumber: 1 });
        (invoiceOrderQuery.length == 0) ? '001' : nextInvoiceNumber = calculateNextOrder(Number(invoiceOrderQuery[invoiceOrderQuery.length -1].invoiceNumber)); 

        const addressList = await AddressBook.find({}).sort({ company: 1 });

        const defaultInformation = await Default.findOne({})

        res.render('new-invoice', {
            todayDate: todayDate,
            dueDate: dueDate,
            nextInvoiceNumber: nextInvoiceNumber,
            addressList: addressList,
            defaultInformation: defaultInformation
        });
    })
    .post(async(req, res) => {
        const soldToCompany = await findOwnerName(req.body.soldTo); 
        const shipToCompany = await findOwnerName(req.body.shipTo);

        const soldTo = {
            id: req.body.soldTo,
            company: soldToCompany
        }

        const shipTo = {
            id: req.body.shipTo,
            company: shipToCompany
        }
        
        const newInvoice = new Invoice({
            invoiceNumber: req.body.invoiceNumber,
            date: req.body.date,
            dueDate: req.body.dueDate,
            terms: req.body.terms,
            lineItems: [],
            soldTo: soldTo,
            shipTo: shipTo,
            orderStatus:  {status: 'open'},
            shipMethod: req.body.shipMethod,
            currency: req.body.currency,
            discount: req.body.discount,
            notes: req.body.notes, 
        });
        newInvoice.save();
        res.redirect(`/invoicing/view-invoice-id=${newInvoice._id}`);
    });

app.route('/invoicing/search-invoice')
    .post(async (req, res) => {
        const searchValue = req.body.searchValue;
        
        const showAll = true;

        const perPage = 1;
        const total = await Invoice.find({ invoiceNumber: searchValue });
        const pages = Math.ceil(total.length / perPage);
        const pageNumber = (req.query.page == null) ? 1 : req.query.page;
        const startFrom = (pageNumber - 1) * perPage;

        const invoices = await Invoice.find({ invoiceNumber: searchValue }).sort({ invoiceNumber: 1 }).skip(startFrom).limit(perPage);
        
        res.render('invoicing', {
            showAll: showAll,
            pages: pages,
            pageNumber: pageNumber,
            invoices: invoices,
            searchValue: searchValue
        });

    });

app.route('/invoicing/update-status')
    .post((req, res) => {
        const invoiceId = req.body.invoiceId;

        Invoice.findByIdAndUpdate(invoiceId, {
            orderStatus: {
                status: req.body.status,
                paymentDate: req.body.paymentDate,
                paymentType: req.body.paymentType,
                invoiceNote: req.body.invoiceNote,         
            }            
        }, (err, docs) => {
            if (err) {
                console.log(`Error: ${err}`);
            } else {
                console.log(docs);
                res.redirect('/invoicing');
            }
        });
    });

app.route('/invoicing/view-invoice-id=:id')
    .get(async(req, res) => {
        const invoice = await Invoice.findOne({ _id: req.params.id });
        const addressList = await AddressBook.find({}).sort({ company: 1 });

        const items = await Inventory.find({}).sort({ itemId: 1 });
        
        const products = [];
        const accessorials = [];

        if (invoice.lineItems === null) {

        } else {
            invoice.lineItems.forEach((item) => {
                if (item.type === 'product') {
                    products.push(item);
                } else {
                    accessorials.push(item);
                }
            });
        }

        res.render('view-invoice', {
            invoice: invoice,
            addressList: addressList,
            items: items,
            products: products,
            accessorials: accessorials,
        });
    });

app.route('/invoicing/invoice=:id')
    .get(async(req, res) => {
        const showAll = false;

        const perPage = 25;
        const total = (req.params.id === 'All') ? await Invoice.find({}) : await Invoice.find({ 'orderStatus.status': req.params.id }) ;
        const pages = Math.ceil(total.length / perPage);
        const pageNumber = (req.query.page == null) ? 1 : req.query.page;
        const startFrom = (pageNumber - 1) * perPage;
        
        const invoices = (req.params.id == 'All') ? await Invoice.find({})
        .sort({ invoiceNumber: 1 })
        .skip(startFrom)
        .limit(perPage) 
        : await Invoice.find({ 'orderStatus.status': req.params.id })
        .sort({ invoiceNumber: 1 })
        .skip(startFrom)
        .limit(perPage)

        res.render('invoicing', {
            showAll: showAll,
            pages: pages,
            pageNumber: pageNumber,
            invoices: invoices
        })
    });

app.route('/invoicing/invoice=:invoiceId/add-line-item')
    .post(async(req, res) => {
        const invoice = req.params.invoiceId;
        const lineItems = {
            _id: crypto.randomUUID(),
            type: req.body.lineItemType,
        }
        
        if (req.body.lineItemType === 'product') {
            const lineTotal = Number(req.body.quantity) * Number(req.body.unitValue); 
            
            lineItems.quantity = req.body.quantity;
            lineItems.unitValue = Number(req.body.unitValue).toFixed(2);
            lineItems.lineTotal = lineTotal.toFixed(2);

            if (req.body.lineItem === 'new') {
                lineItems.itemId = req.body.itemId;
                lineItems.itemDescription = req.body.itemDescription;
    
                const newItem = new Inventory({
                    itemId: req.body.itemId,
                    itemDescription: req.body.itemDescription,
                    unitOfMeasure: req.body.uom,
                    reOrderPoint: req.body.reOrderPoint,
                    sellPrice: Number(req.body.sellPrice).toFixed(2),
                }); 
                newItem.save();
            } else {
                const item = await findItemDetails(req.body.lineItem);
                lineItems.itemId = item.itemId;
                lineItems.itemDescription = item.itemDescription;
            }
        } else {
            const lineTotal = Number(req.body.lineQty) * Number(req.body.lineSellPrice);

            lineItems.itemId = req.body.lineId;
            lineItems.itemDescription = req.body.lineDescription;
            lineItems.quantity = req.body.lineQty;
            lineItems.unitValue = Number(req.body.lineSellPrice).toFixed(2);
            lineItems.lineTotal = lineTotal.toFixed(2);
        }

        Invoice.findOneAndUpdate({ _id: invoice }, {
            $push : {lineItems: lineItems}
        },(err, success) => { 
            if (!err) { 
                console.log(`${success}`);
                res.redirect(`/invoicing/view-invoice-id=${invoice}`);
            } else { 
                console.log(`Error: ${err}`) 
            } 
        });
    })

app.route('/invoicing/invoice=:invoiceId/delete-line-id=:lineId')
    .get((req, res) => {
        const invoiceId = req.params.invoiceId;
        const lineId = req.params.lineId;

        Invoice.findOneAndUpdate({ _id: invoiceId }, {
            $pull: {
                lineItems: {
                    _id: lineId
                }
            }
        }, (err, success) => {
            if (!err) { 
                console.log(`${success}`); 
                res.redirect(`/invoicing/view-invoice-id=${invoiceId}`);
            } else {
                console.log(`Error: ${err}`);
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

app.route('/logistics/print-logistics-callsheet-id=:id')
    .get(async (req, res) => {
        const orderId = req.params.id;
        const quote = await Order.findOne({ _id: orderId });

        const customer = await AddressBook.findOne({ _id: quote.client.id });
        const shipper = await AddressBook.findOne({ _id: quote.shipper.id });
        const consignee = await AddressBook.findOne({ _id: quote.consignee.id });

        printLogisticsCallSheet(quote, customer, shipper, consignee, res);
    })

app.route('/logistics/print-carrier-ratesheet-id=:id')
    .get(async (req, res) => {
        const orderId = req.params.id;
        const quote = await Order.findOne({ _id: orderId });

        printCarrierRateSheet(quote, res);
    })

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

        searchQuery[searchFilter] = { $regex: '.*' + searchValue + '.*' };

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
    .get(async(req, res) => {
        const userQuery = User.find({}).sort({ username: 1 });
        const showAll = false;
        const username = '';
        
        const addressList = await AddressBook.find({}).sort({company: 1})
        
        const defaultInformation = await Default.findOne({});

        userQuery.exec((err, users) => {
            if (!err) {
                res.render('settings', {
                    users: users,
                    showAll: showAll,
                    userId: username,
                    addressList: addressList,
                    defaultInformation: defaultInformation
                });
            } else {
                console.log(err);
            }
        })
    });

app.route('/settings/create-defaults')
    .post(async(req, res) => {
        const newDefault = new Default({
            owner: {
                company: req.body.ownerCompany,
                attention: req.body.ownerAttention,
                addressOne: req.body.ownerAddressOne,
                addressTwo: req.body.ownerAddressTwo,
                city: req.body.ownerCity,
                state: req.body.ownerState,
                postal: req.body.ownerPostal,
                country: req.body.ownerCountry,
                phone: req.body.phone, 
                fax: req.body.fax,
                email: req.body.email
            },
            purchasing: {
                billTo: '',
                vendor: '',
                shipTo: ''
            },
            invoicing: {
                billTo: '',
                shipTo: ''     
            }
        })
        newDefault.save();
        res.redirect('/settings');
    });

app.route('/settings/edit-defaults')
    .post(async(req, res) => {       
        const defaultSetting = await Default.findOne({});


        Default.findByIdAndUpdate(defaultSetting._id, {
            owner: {
                company: req.body.ownerCompany,
                attention: req.body.ownerAttention,
                addressOne: req.body.ownerAddressOne,
                addressTwo: req.body.ownerAddressTwo,
                city: req.body.ownerCity,
                state: req.body.ownerState,
                postal: req.body.ownerPostal,
                country: req.body.ownerCountry,
                phone: req.body.ownerPhone, 
                fax: req.body.ownerFax,
                email: req.body.ownerEmail
            },
            purchasing: {
                billTo: req.body.purchasingBillTo,
                vendor: req.body.purchasingVendor,
                shipTo: req.body.purchasingShipTo
            },
            invoicing: {
                billTo: req.body.invoicingBillTo,
                shipTo: req.body.invoicingShipTo      
            }
        }, (err, docs) => {
            if (err) {
                console.log(err);
            } else {
                console.log(docs);
                res.redirect('/settings');
            }
        });
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
    .get(async (req, res) => {
        const customerList = await AddressBook.find({ customer: true }).sort({ company: 1 });
        
        // carrier list to be made up of the carrier in the quotes
        const carrierList = [];
        // create function to split up the date into columns

        const orders = [];
        const ltl = [];
        const tl = [];
        
        res.render('orders', {
            customerList: customerList,
            carrierList: carrierList,
        });
    });

app.route('/orders/edit-order-id=:id')
    .post(async(req, res) => {
        const editId = req.params.id;

        const addressInformation = await addNewAddress(req);

        const genericShipper = {};
        const genericConsignee = {};

        if (req.body.shipper === '') {
            genericShipper.city = req.body.genericShipperCity,
            genericShipper.state = req.body.genericShipperState,
            genericShipper.country = req.body.genericShipperCountry
        } else {
            let shipper = await AddressBook.findOne({ _id: req.body.shipper });
            genericShipper.city = shipper.city;
            genericShipper.state = shipper.state;
            genericShipper.country = shipper.country;
        }

        if (req.body.consignee === '') {
            genericConsignee.city = req.body.genericConsigneeCity,
            genericConsignee.state = req.body.genericConsigneeState,
            genericConsignee.country = req.body.genericConsigneeCountry
        } else {
            let consignee = await AddressBook.findOne({ _id: req.body.consignee });
            genericConsignee.city = consignee.city;
            genericConsignee.state = consignee.state;
            genericConsignee. country = consignee.country;
        }
        
        let dv = false;
        let rf = false;
        let du = false;
        let fd = false;
        let sd = false;
        let sb = false;
        let dd = false;
        let fu = false;
        let rl = false;
        
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

        Order.findByIdAndUpdate(editId, {
            quoteTaker: req.body.quoteTaker,
            freightSize: req.body.freightSize,
            importExport: req.body.importExport,
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
            genericShipper: genericShipper,
            consignee: {
                id: addressInformation.newConsignee.id,
                company: addressInformation.newConsignee.company
            },
            genericConsignee: genericConsignee,
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
            notes: req.body.orderNotes,
        }, (err, docs) => {
            if (err) {
                console.log(`Error: ${err}`);
            } else {
                console.log(docs);
                res.redirect('/orders');
            }
        })
    });

app.route('/orders/new-order')
    .get(async(req, res) => {
        const date = new Date();
        const todayDate = `${date.getFullYear()}-${dateStringFormat(date.getUTCMonth() +1)}-${dateStringFormat(date.getUTCDate())}`;
        
        const addressList = await AddressBook.find({}).sort({ company: 1} );
        
        res.render('new-order', {
            todayDate: todayDate,
            addressList: addressList
        });
    })
    .post(async(req,res) => {
        const addressInformation = await addNewAddress(req);

        const genericShipper = {};
        const genericConsignee = {};

        if (req.body.shipper === '') {
            genericShipper.city = req.body.genericShipperCity,
            genericShipper.state = req.body.genericShipperState,
            genericShipper.country = req.body.genericShipperCountry
        } else {
            let shipper = await AddressBook.findOne({ _id: req.body.shipper });
            genericShipper.city = shipper.city;
            genericShipper.state = shipper.state;
            genericShipper.country = shipper.country;
        }

        if (req.body.consignee === '') {
            genericConsignee.city = req.body.genericConsigneeCity,
            genericConsignee.state = req.body.genericConsigneeState,
            genericConsignee.country = req.body.genericConsigneeCountry
        } else {
            let consignee = await AddressBook.findOne({ _id: req.body.consignee });
            genericConsignee.city = consignee.city;
            genericConsignee.state = consignee.state;
            genericConsignee. country = consignee.country;
        }
        
        let dv = false;
        let rf = false;
        let du = false;
        let fd = false;
        let sd = false;
        let sb = false;
        let dd = false;
        let fu = false;
        let rl = false;
        
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
            importExport: req.body.importExport,
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
            genericShipper: genericShipper,
            consignee: {
                id: addressInformation.newConsignee.id,
                company: addressInformation.newConsignee.company
            },
            genericConsignee: genericConsignee,
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
            notes: req.body.orderNotes
        }); 
        newJob.save();
        res.redirect(`/orders/view-order-id=${newJob._id}`);   
    });

app.route('/orders/search-by-quote')
    .post(async (req, res) => {
        const quoteId = await Order.findOne({ quoteNumber: req.body.quoteId.toUpperCase() });
        if (quoteId === null ) {
            const message = {
                messageText: 'Record Does not Exist.',
                page: 'Orders',
                link: '/orders'
            }
            res.render('error', { message: message });
        } else {
            res.redirect(`/orders/view-order-id=${quoteId._id}`);
        }
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

app.route('/orders/carrier-rates-order-id=:id')
    .get(async (req, res) => {
        const date = new Date();
        const todayDate = `${date.getFullYear()}-${dateStringFormat(date.getUTCMonth() +1)}-${dateStringFormat(date.getUTCDate())}`;
        const order = await Order.findOne({ _id: req.params.id });

        

        const lane = {}

        const carrierRates = order.carrierRates;
        if (carrierRates.length === 0) {
            lane.name = '',
            lane.shipper = {
                city: order.genericShipper.city,
                state: order.genericShipper.state,
            }
            lane.consignee = {
                city: order.genericConsignee.city,
                state: order.genericConsignee.state,
            }
        } else {
            lane.name = carrierRates[carrierRates.length - 1].name

            lane.shipper = {
                city: carrierRates[carrierRates.length - 1].shipper.city,
                state: carrierRates[carrierRates.length - 1].shipper.state,
            }
    
            lane.consignee = {
                city: carrierRates[carrierRates.length - 1].consignee.city,
                state: carrierRates[carrierRates.length - 1].consignee.state,
            }
        }

        res.render('carrier-rates', {
            todayDate: todayDate,
            order: order,
            lane: lane,
        });
    })
    .post((req, res) => {
        const order = req.params.id;
        const asked = currency.format(req.body.asked).slice(2);
        const carrierQuoteValue = currency.format(req.body.carrierQuoteValue).slice(2);

        const carrierRates = {
            _id: crypto.randomUUID(),
            name: req.body.name,
            quote: req.body.quote,
            date: req.body.date,
            shipper: {
                city: req.body.pickupCity,
                state: req.body.pickupState
            },
            consignee: {
                city: req.body.deliveryCity,
                state: req.body.deliveryState
            },
            dispatchName: req.body.dispatchName,
            carrierName: req.body.carrierName,
            carrierPhone: req.body.carrierPhone,
            carrierEquipment: req.body.carrierEquipment.toUpperCase(),
            asked: asked,
            carrierQuoteValue: carrierQuoteValue,
            carrierQuoteCurrency: req.body. carrierQuoteCurrency.toUpperCase(),
            carrierQuote: req.body.carrierQuote.toUpperCase(),
            carrierTruck: req.body.carrierTruck.toUpperCase(),
            carrierTrailer: req.body.carrierTrailer.toUpperCase(),
            pickupDate: req.body.pickupDate.toUpperCase(),
            deliveryDate: req.body.deliveryDate.toUpperCase(),
            papsPars: req.body.papsPars.toUpperCase(),
            crossing: req.body.crossing,
            carrierNotes: req.body.carrierNotes
        }

        Order.findOneAndUpdate({ _id: order }, {
            $push : { carrierRates: carrierRates }
        },(err, success) => { 
            if (!err) { 
                console.log(`${success}`);
                res.redirect(`/orders/carrier-rates-order-id=${order}`);
            } else { 
                console.log(`Error: ${err}`) 
            } 
        });
    });

app.route('/orders/order=:orderId/delete-line-id=:lineId')
    .get((req, res) => {
        const orderId = req.params.orderId;
        const lineId = req.params.lineId;

        Order.findOneAndUpdate({ _id: orderId }, {
            $pull: {
                carrierRates: {
                    _id: lineId
                }
            }
        }, (err, success) => {
            if (!err) { 
                console.log(`${success}`); 
                res.redirect(`/orders/carrier-rates-order-id=${orderId}`);
            } else {
                console.log(`Error: ${err}`);
            } 
        });
    });

app.route('/orders/order=:orderId/edit-line-id=:lineId')
    .post(async (req, res) => {
        const orderId = req.params.orderId;
        const lineId = req.params.lineId;

        let asked = req.body.asked;
        let carrierQuoteValue = req.body.carrierQuoteValue;

        if (asked[0] === '$') {
            asked = asked.slice(1);
        }

        if (carrierQuoteValue[0] === '$') {
            carrierQuoteValue = carrierQuoteValue.slice(1);
        }

        Order.findOneAndUpdate({ 'carrierRates._id': lineId }, {
            $set: {
                'carrierRates.$': {
                    _id: lineId,
                    name: req.body.name,
                    quote: req.body.quote,
                    date: req.body.date,
                    shipper: {
                        city: req.body.pickupCity,
                        state: req.body.pickupState
                    },
                    consignee: {
                        city: req.body.deliveryCity,
                        state: req.body.deliveryState
                    },
                    dispatchName: req.body.dispatchName,
                    carrierName: req.body.carrierName,
                    carrierPhone: req.body.carrierPhone,
                    carrierEquipment: req.body.carrierEquipment.toUpperCase(),
                    asked: currency.format(asked).slice(2),
                    carrierQuoteValue: currency.format(carrierQuoteValue).slice(2),
                    carrierQuoteCurrency: req.body. carrierQuoteCurrency.toUpperCase(),
                    carrierQuote: req.body.carrierQuote.toUpperCase(),
                    carrierTruck: req.body.carrierTruck.toUpperCase(),
                    carrierTrailer: req.body.carrierTrailer.toUpperCase(),
                    pickupDate: req.body.pickupDate.toUpperCase(),
                    deliveryDate: req.body.deliveryDate.toUpperCase(),
                    papsPars: req.body.papsPars.toUpperCase(),
                    crossing: req.body.crossing,
                    carrierNotes: req.body.carrierNotes
                }
            }
        }, (err, success) => {
            if (!err) { 
                console.log(`${success}`); 
                res.redirect(`/orders/carrier-rates-order-id=${orderId}`);
            } else {
                console.log(`Error: ${err}`);
            } 
        });
    });

app.route('/print-purchase-order-:id')
    .get(async (req, res) => {
        const id = req.params.id; 
        
        const purchaseOrder = await Purchasing.findOne({ _id: id });

        const soldTo = await AddressBook.findOne({ _id: purchaseOrder.soldTo.id });
        const vendor = await AddressBook.findOne({ _id: purchaseOrder.vendor.id });
        const shipTo = await AddressBook.findOne({ _id: purchaseOrder.shipTo.id });
        
        printPurchaseOrder(purchaseOrder, soldTo, vendor, shipTo, taxes, res);
    });

app.route('/print-invoice-:id')
    .get(async (req, res) => {
        const id = req.params.id;

        const invoice = await Invoice.findOne({ _id: id });

        const defaults = await Default.findOne({});
        const owner = defaults.owner;
        const soldTo = await AddressBook.findOne({ _id: invoice.soldTo.id });
        const shipTo = await AddressBook.findOne({ _id: invoice.shipTo.id });

        printInvoice(invoice, owner, soldTo, shipTo, taxes, res);
    });

app.route('/purchasing')
    .get(async(req, res) => {
        const showAll = false;

        const perPage = 15;
        const total = await Purchasing.find({ 'orderStatus.status': 'open' });
        const pages = Math.ceil(total.length / perPage);
        const pageNumber = (req.query.page == null) ? 1 : req.query.page;
        const startFrom = (pageNumber - 1) * perPage;

        const purchaseOrders = await Purchasing.find({ 'orderStatus.status': 'open' }).sort({ purchaseOrderNumber: 1 }).skip(startFrom).limit(perPage);
        
        res.render('purchasing', {
            showAll: showAll,
            pages: pages,
            pageNumber: pageNumber,
            purchaseOrders: purchaseOrders
        });
    });

app.route('/purchasing/delete-po')
    .post((req, res) => {
        const deleteIds = req.body.poId;

        Purchasing.deleteMany({ _id: deleteIds }, (err) => {
            if (!err) {
                console.log(`Successfully deleted item(s)`);
                res.redirect('/purchasing');
            } else {
                console.log(`Error: ${err}`);
            }
        });
    });

app.route('/purchasing/po=:poId/add-line-item')
    .post(async (req, res) => {
        const purchaseOrder = req.params.poId;
        const lineItems = {
            _id: crypto.randomUUID(),
            type: req.body.lineItemType,
        }
        
        if (req.body.lineItemType === 'product') {
            const lineTotal = Number(req.body.quantity) * Number(req.body.unitValue); 
            
            lineItems.quantity = req.body.quantity;
            lineItems.unitValue = Number(req.body.unitValue).toFixed(2);
            lineItems.lineTotal = lineTotal.toFixed(2);

            if (req.body.lineItem === 'new') {
                lineItems.itemId = req.body.itemId;
                lineItems.itemDescription = req.body.itemDescription;
    
                const newItem = new Inventory({
                    itemId: req.body.itemId,
                    itemDescription: req.body.itemDescription,
                    unitOfMeasure: req.body.uom,
                    reOrderPoint: req.body.reOrderPoint,
                    sellPrice: Number(req.body.sellPrice).toFixed(2),
                }); 
                newItem.save();
            } else {
                const item = await findItemDetails(req.body.lineItem);
                lineItems.itemId = item.itemId;
                lineItems.itemDescription = item.itemDescription;
            }
        } else {
            const lineTotal = Number(req.body.lineQty) * Number(req.body.lineSellPrice);

            lineItems.itemId = req.body.lineId;
            lineItems.itemDescription = req.body.lineDescription;
            lineItems.quantity = req.body.lineQty;
            lineItems.unitValue = Number(req.body.lineSellPrice).toFixed(2);
            lineItems.lineTotal = lineTotal.toFixed(2);
        }

        Purchasing.findOneAndUpdate({ _id: purchaseOrder }, {
            $push : {lineItems: lineItems}
        },(err, success) => { 
            if (!err) { 
                console.log(`${success}`);
                res.redirect(`/purchasing/view-po-id=${purchaseOrder}`);
            } else { 
                console.log(`Error: ${err}`) 
            } 
        });
    });

app.route('/purchasing/po-id=:poId/delete-line-id=:lineId')
    .get((req, res) => {
        const poId = req.params.poId;
        const lineId = req.params.lineId;

        Purchasing.findOneAndUpdate({ _id: poId }, {
            $pull: {
                lineItems: {
                    _id: lineId
                }
            }
        }, (err, success) => {
            if (!err) { 
                console.log(`${success}`); 
                res.redirect(`/purchasing/view-po-id=${poId}`);
            } else {
                console.log(`Error: ${err}`);
            } 
        });
    });

app.route('/purchasing/edit-po/id=:id')
    .post(async (req, res) => {
        const editId = req.params.id;
        let currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CAD' });
        const soldToCompany = await findOwnerName(req.body.soldTo); 
        const vendorCompany = await findOwnerName(req.body.vendor);
        const shipToCompany = await findOwnerName(req.body.shipTo);

        const soldTo = {
            id: req.body.soldTo,
            company: soldToCompany
        }
    
        const vendor = {
            id: req.body.vendor,
            company: vendorCompany
        }
        
        const shipTo = {
            id: req.body.shipTo,
            company: shipToCompany
        }

        const lineTotals = await Purchasing.findOne({ _id: editId });

        const lineTotal = await calculateInvoiceTotal(lineTotals.lineItems, 0, false);

        const invoiceTotal = currency.format(lineTotal).slice(2);

        Purchasing.findByIdAndUpdate(editId, {
            date: req.body.date,
            soldTo: soldTo,
            vendor: vendor,
            shipTo: shipTo,
            shipMethod: req.body.shipVia,
            currency: req.body.currency,
            notes: req.body.notes,
            invoiceTotal: invoiceTotal,
        }, (err, docs) => {
            if (err) {
                console.log(err);
            } else {
                console.log(docs);
                res.redirect(`/purchasing`);
            }
        });
    });

app.route('/purchasing/new-order')
    .get(async(req, res) => {
        const date = new Date();
        const todayDate = `${date.getFullYear()}-${dateStringFormat(date.getUTCMonth() +1)}-${dateStringFormat(date.getUTCDate())}`

        let nextPurchaseOrder = '';

        let purchaseOrderQuery = await Purchasing.find({}).sort({ purchaseOrderNumber: 1 });
        (purchaseOrderQuery.length == 0) ? '001' : nextPurchaseOrder = calculateNextOrder(Number(purchaseOrderQuery[purchaseOrderQuery.length -1].purchaseOrderNumber)); 

        const addressList = await AddressBook.find({}).sort({ company: 1 });

        const defaultInformation = await Default.findOne({})

        res.render('new-purchase-order', {
            todayDate: todayDate,
            nextPurchaseOrder: nextPurchaseOrder,
            addressList: addressList,
            defaultInformation: defaultInformation
        });
    })
    .post(async(req, res) => {
        const soldToCompany = await findOwnerName(req.body.soldTo); 
        const vendorCompany = await findOwnerName(req.body.vendor);
        const shipToCompany = await findOwnerName(req.body.shipTo);

        const soldTo = {
            id: req.body.soldTo,
            company: soldToCompany
        }
    
        const vendor = {
            id: req.body.vendor,
            company: vendorCompany
        }

        const shipTo = {
            id: req.body.shipTo,
            company: shipToCompany
        }
        
        const newPurchaseOrder = new Purchasing({
            purchaseOrderNumber: req.body.poNumber,
            date: req.body.date,
            soldTo: soldTo,
            vendor: vendor,
            shipTo: shipTo,
            lineItems: [],
            paidVia: req.body.paidVia,
            orderStatus:  {status: 'open'},
            shipMethod: req.body.shipVia,
            currency: req.body.currency,
            notes: req.body.notes, 
        });
        newPurchaseOrder.save();
        res.redirect(`/purchasing/view-po-id=${newPurchaseOrder._id}`);
    });

app.route('/purchasing/orders=:id')
    .get(async(req, res) => {
        const showAll = false;

        const perPage = 25;
        const total = (req.params.id === 'All') ? await Purchasing.find({}) : await Purchasing.find({ 'orderStatus.status': req.params.id }) ;
        const pages = Math.ceil(total.length / perPage);
        const pageNumber = (req.query.page == null) ? 1 : req.query.page;
        const startFrom = (pageNumber - 1) * perPage;
        
        const purchaseOrders = (req.params.id == 'All') ? await Purchasing.find({})
        .sort({ purchaseOrderNumber: 1 })
        .skip(startFrom)
        .limit(perPage) 
        : await Purchasing.find({ 'orderStatus.status': req.params.id })
        .sort({ purchaseOrderNumber: 1 })
        .skip(startFrom)
        .limit(perPage)

        res.render('purchasing', {
            showAll: showAll,
            pages: pages,
            pageNumber: pageNumber,
            purchaseOrders: purchaseOrders
        })
    });

app.route('/purchasing/search-PO')
    .post(async (req, res) => {
        const searchValue = req.body.searchValue;
        
        const showAll = true;

        const perPage = 1;
        const total = await Purchasing.find({ purchaseOrderNumber: searchValue });
        const pages = Math.ceil(total.length / perPage);
        const pageNumber = (req.query.page == null) ? 1 : req.query.page;
        const startFrom = (pageNumber - 1) * perPage;

        const purchaseOrders = await Purchasing.find({ purchaseOrderNumber: searchValue }).sort({ purchaseOrderNumber: 1 }).skip(startFrom).limit(perPage);
        
        res.render('purchasing', {
            showAll: showAll,
            pages: pages,
            pageNumber: pageNumber,
            purchaseOrders: purchaseOrders,
            searchValue: searchValue
        });

    });

app.route('/purchasing/update-status')
    .post((req, res) => {
        const poId = req.body.poId;

        Purchasing.findByIdAndUpdate(poId, {
            orderStatus: {
                status: req.body.status,
                paymentDate: req.body.paymentDate,
                paymentType: req.body.paymentType,
                productReceived: req.body.productReceived,         
            }            
        }, (err, docs) => {
            if (err) {
                console.log(`Error: ${err}`);
            } else {
                console.log(docs);
                res.redirect('/purchasing');
            }
        });
    });

app.route('/purchasing/view-po-id=:id')
    .get(async (req, res) => {
        const purchaseOrder = await Purchasing.findOne({ _id: req.params.id });
        const addressList = await AddressBook.find({}).sort({ company: 1 });

        const items = await Inventory.find({}).sort({ itemId: 1 });
        
        const products = [];
        const accessorials = [];

        if (purchaseOrder.lineItems === null) {

        } else {
            purchaseOrder.lineItems.forEach((item) => {
                if (item.type === 'product') {
                    products.push(item);
                } else {
                    accessorials.push(item);
                }
            });
        }


        res.render('view-purchase-order', {
            purchaseOrder: purchaseOrder,
            addressList: addressList,
            items: items,
            products: products,
            accessorials: accessorials,
        });
    });

app.route('/warehousing')
    .get(async (req, res) => {
        const items = await Inventory.find({}).sort({ itemId: 1 });
        const vendors = await AddressBook.find({ vendor: true }).sort({ company: 1 });
        res.render('warehousing', { 
            items: items,
            vendors: vendors
        });
    })

let port = process.env.PORT;
if (port == null || port == '') {
    port = 3000;
}

app.listen(port || 3000, () => {
    console.log('Server Started on port ' + port);
});
