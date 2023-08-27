const PDFDocument = require('pdfkit-table')

function buildInvoice(dataCallback, endCallback, invoice, owner, soldTo, shipTo, taxes) {
    const doc = new PDFDocument({ size: 'Letter', margins: { left: 45, right: 55, bottom: 5 } });

    const docWidth = 612;
    const docHeight = 792;

    doc.on('data', dataCallback);
    doc.on('end', endCallback);
    
    doc.fontSize(20);
    doc.font('Helvetica-Bold');
    doc.text(`${owner.company}`, 50, 70);
    doc.font('Helvetica');   
    doc.fontSize(10);
    doc.text(`${owner.addressOne}`, 50, 100);
    doc.text(`${owner.city} ${owner.state} ${owner.postal}`);
    doc.text(`(c): ${owner.phone}`);
    doc.text(`(e): ${owner.email}`);

    doc.fontSize(20);
    doc.font('Helvetica-Bold');
    doc.fillColor('red');
    doc.text(`Invoice`, 351, 50, { align: 'right' });
    doc.fillColor('black');
    doc.font('Helvetica');
    doc.fontSize(10);

    doc.text(`Invoice #:`, 400, 75, { align: 'left' });
    doc.text(`Date:`, 400, 90, { align: 'left' });
    doc.text(`Due Date:`, 400, 105, { align: 'left' })
    doc.text(`Currency:`, 400, 120, { align: 'left' });
    doc.text(`Ship Method:`, 400, 135, { align: 'left' });
    
    doc.text(`${invoice.invoiceNumber}`, 480, 75, { align: 'right' });
    doc.text(`${invoice.date}`, 480, 90, { align: 'right' });
    doc.text(`${invoice.dueDate}`, 480, 105, { align: 'right' })
    doc.text(`${invoice.currency}`, 400, 120, { align: 'right' });
    doc.text(`${invoice.shipMethod}`, 400, 135, { align: 'right' });

    doc.moveTo(45, 170).lineTo((docWidth - 45), 170).stroke();
    doc.moveTo(45, 187).lineTo((docWidth - 45), 187).stroke();

    doc.moveTo(45, 170).lineTo(45, (docHeight - 25)).stroke();
    doc.moveTo(((docWidth / 2) - 5), 170).lineTo(((docWidth / 2) - 5), 252).stroke();
    doc.moveTo(((docWidth / 2) + 5), 170).lineTo(((docWidth / 2) + 5), 252).stroke();
    
    doc.moveTo((docWidth - 45), 170).lineTo((docWidth - 45), (docHeight - 25)).stroke();

    doc.moveTo(45, 252).lineTo((docWidth - 45), 252).stroke();
    doc.moveTo(45, 257).lineTo((docWidth - 45), 257).stroke();
    doc.moveTo(45, (docHeight - 25)).lineTo((docWidth - 45), (docHeight - 25));

    doc.moveTo(45, (docHeight - 120)).lineTo((docWidth - 45), (docHeight - 120)).stroke();
    doc.moveTo(45, (docHeight - 115)).lineTo((docWidth - 45), (docHeight - 115)).stroke();
    doc.moveTo(45, (docHeight - 98)).lineTo((docWidth / 2) + 50, (docHeight - 98)).stroke();
    doc.moveTo(((docWidth / 2) + 50), (docHeight - 115)).lineTo(((docWidth / 2) + 50), (docHeight - 25)).stroke();
    doc.moveTo(((docWidth / 2) + 55), (docHeight - 115)).lineTo(((docWidth / 2) + 55), (docHeight - 25)).stroke();
    doc.moveTo(((docWidth / 2) + 55), (docHeight - 45)).lineTo((docWidth - 45), (docHeight - 45)).stroke();

    doc.fontSize(10);
    doc.font(`Helvetica-Bold`);
    doc.text(`Sold To:`, 60, 175);
    
    doc.fontSize(12);
    doc.font(`Helvetica-Bold`);
    doc.text(`${soldTo.company}`, 60, 192);
    doc.fontSize(9);
    doc.font('Helvetica');
    if (soldTo.addressTwo === '') {
        doc.text(`${soldTo.addressOne}`);
    } else {
        doc.text(`${soldTo.addressOne} - ${soldTo.addressTwo}`);
    }
    doc.text(`${soldTo.city} ${soldTo.state} ${soldTo.postal}`);
    doc.text(`(p): ${soldTo.phone}`);
    doc.text(`(e): ${soldTo.email}`);

    doc.fontSize(10);
    doc.font(`Helvetica-Bold`);
    doc.text(`Ship To:`, ((docWidth / 2) + 15), 175);

    doc.fontSize(12);
    doc.font(`Helvetica-Bold`);
    doc.text(`${shipTo.company}`, ((docWidth / 2) + 15), 192);
    doc.fontSize(9);
    doc.font(`Helvetica`);
    if (shipTo.addressTwo === '') {
        doc.text(`${shipTo.addressOne}`);
    } else {
        doc.text(`${shipTo.addressOne} - ${shipTo.addressTwo}`);
    }
    doc.text(`${shipTo.city} ${shipTo.state} ${shipTo.postal}`);
    doc.text(`(p): ${shipTo.phone}`);
    doc.text(`(e): ${shipTo.email}`);

    const table = {
        title: '',
        headers: [
            {label: `Item Id`, property: `itemId`, width: 70},
            {label: `Quantity`, property: `quantity`, width: 70, align: 'center'},
            {label: `Description`, property: `itemDescription`, width: ((docWidth - 100) - (70 * 4))},
            {label: `Price`, property: `unitValue`, width: 70, align: 'right'},
            {label: `Line Total`, property: `lineTotal`, width: 70, align: 'right'},
        ],
        rows: [],
        datas: invoice.lineItems
    }

    doc.table(table, { width: (docWidth - 50), x: 50, y: 273 });

    doc.font(`Helvetica-Bold`);
    doc.fontSize(12);
    if (invoice.terms === 'Immediately') {
        doc.text(`** Please pay the invoice upon receipt **`, 45, (docHeight - 145), { align: 'center' })
    } else {
        doc.text(`** Please pay the invoice within ${invoice.terms} **`, 45, (docHeight - 145), { align: 'center' });
    }

    const subTotals = [];

    invoice.lineItems.forEach((line) => {
        subTotals.push(Number(line.lineTotal));
    });

    let currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CAD' });

    let subTotal = subTotals.reduce((a, b) => a + b, 0);
    const disc = subTotal * (Number(invoice.discount) / 100);
    subTotal = subTotal - disc;
    // const gst = (Number(subTotal) * (Number(taxes.GST) / 100));
    const gst = 0;
    const pst = (Number(subTotal) * (Number(taxes.PST) / 100));
    const total = Number(subTotal) + Number(gst) + Number(pst);

    doc.fontSize(10);
    doc.font(`Helvetica-Bold`);
    doc.text(`Notes:`, 48, (docHeight - 110));
    doc.fontSize(8);
    doc.text(`${invoice.notes}`, 48, (docHeight - 92), {align: 'left', width: (docWidth / 2)});

    doc.fontSize(9);
    doc.font(`Helvetica`);
    doc.text(`Sub Total:`, ((docWidth / 2) + 60), (docHeight - 110));
    if (invoice.discount === null) {
        doc.text(`PST @ ${taxes.PST}%:`, ((docWidth / 2) + 60), (docHeight - 95));
        if (taxes.GST != 0){
            doc.text(`GST @ ${taxes.GST}%:`, ((docWidth / 2) + 60), (docHeight - 80));
        }
    } else {
        doc.text(`Discount (${invoice.discount} %):`, ((docWidth / 2) + 60), (docHeight - 95));
        doc.text(`PST @ ${taxes.PST}%:`, ((docWidth / 2) + 60), (docHeight - 80));
        if (taxes.GST != 0) {
            doc.text(`GST @ ${taxes.GST}%:`, ((docWidth / 2) + 60), (docHeight - 65));
        }
    }
    doc.text(`Total (${invoice.currency}):`, ((docWidth / 2) + 60), (docHeight - 40));

    doc.text(`${currency.format((subTotal + disc)).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 110), {align: 'right'});
    if (invoice.discount === null) {
        doc.text(`${currency.format(pst).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 95), {align: 'right'});
        if (taxes.GST != 0) {
            doc.text(`${currency.format(gst).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 80), {align: 'right'});
        }
    } else {
        doc.text(`- ${currency.format(disc).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 95), {align: 'right'});
        doc.text(`${currency.format(pst).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 80), {align: 'right'});
        if (taxes.GST != 0) {
            doc.text(`${currency.format(gst).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 65), {align: 'right'});
        }
    }
    doc.text(`${currency.format(total).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 40), {align: 'right'});

    doc.end();
}

function buildPurchaseOrder(dataCallback, endCallback, order, soldTo, vendor, shipTo, taxes) {
    const doc = new PDFDocument({ size: 'Letter', margins: { left: 45, right: 55, bottom: 5 } });

    const docWidth = 612;
    const docHeight = 792;

    doc.on('data', dataCallback);
    doc.on('end', endCallback);
    
    doc.fontSize(20);
    doc.font('Helvetica-Bold');
    doc.text(`${soldTo.company}`, 50, 70); buildPurchaseOrder
    doc.font('Helvetica');   
    doc.fontSize(10);
    doc.text(`${soldTo.addressOne}`, 50, 100);
    doc.text(`${soldTo.city} ${soldTo.state} ${soldTo.postal}`);
    doc.text(`(c): ${soldTo.phone}`);
    doc.text(`(e): ${soldTo.email}`);

    doc.fontSize(20);
    doc.font('Helvetica-Bold');
    doc.fillColor('red');
    doc.text(`Purchase Order`, 351, 50, { align: 'right' });
    doc.fillColor('black');
    doc.font('Helvetica');
    doc.fontSize(10);

    doc.text(`PO #:`, 400, 75, { align: 'left' });
    doc.text(`Date:`, 400, 90, { align: 'left' });
    doc.text(`Currency:`, 400, 120, { align: 'left' });
    doc.text(`Ship Method:`, 400, 135, { align: 'left' });
    
    doc.text(`${order.purchaseOrderNumber}`, 480, 75, { align: 'right' });
    doc.text(`${order.date}`, 480, 90, { align: 'right' });
    doc.text(`${order.currency}`, 400, 120, { align: 'right' });
    doc.text(`${order.shipMethod}`, 400, 135, { align: 'right' });

    doc.moveTo(45, 170).lineTo((docWidth - 45), 170).stroke();
    doc.moveTo(45, 187).lineTo((docWidth - 45), 187).stroke();

    doc.moveTo(45, 170).lineTo(45, (docHeight - 25)).stroke();
    doc.moveTo(((docWidth / 2) - 5), 170).lineTo(((docWidth / 2) - 5), 252).stroke();
    doc.moveTo(((docWidth / 2) + 5), 170).lineTo(((docWidth / 2) + 5), 252).stroke();
    
    doc.moveTo((docWidth - 45), 170).lineTo((docWidth - 45), (docHeight - 25)).stroke();

    doc.moveTo(45, 252).lineTo((docWidth - 45), 252).stroke();
    doc.moveTo(45, 257).lineTo((docWidth - 45), 257).stroke();
    doc.moveTo(45, (docHeight - 25)).lineTo((docWidth - 45), (docHeight - 25));

    doc.moveTo(45, (docHeight - 100)).lineTo((docWidth - 45), (docHeight - 100)).stroke();
    doc.moveTo(45, (docHeight - 105)).lineTo((docWidth - 45), (docHeight - 105)).stroke();
    doc.moveTo(45, (docHeight - 82)).lineTo((docWidth / 2) + 50, (docHeight - 82)).stroke();
    doc.moveTo(((docWidth / 2) + 50), (docHeight - 100)).lineTo(((docWidth / 2) + 50), (docHeight - 25)).stroke();
    doc.moveTo(((docWidth / 2) + 55), (docHeight - 100)).lineTo(((docWidth / 2) + 55), (docHeight - 25)).stroke();
    doc.moveTo(((docWidth / 2) + 55), (docHeight - 45)).lineTo((docWidth - 45), (docHeight - 45)).stroke();

    doc.fontSize(10);
    doc.font(`Helvetica-Bold`);
    doc.text(`Vendor:`, 60, 175);
    
    doc.fontSize(12);
    doc.font(`Helvetica-Bold`);
    doc.text(`${vendor.company}`, 60, 192);
    doc.fontSize(9);
    doc.font('Helvetica');
    if (vendor.addressTwo === '') {
        doc.text(`${vendor.addressOne}`);
    } else {
        doc.text(`${vendor.addressOne} - ${vendor.addressTwo}`);
    }
    doc.text(`${vendor.city} ${vendor.state} ${vendor.postal}`);
    doc.text(`(p): ${vendor.phone}`);
    doc.text(`(e): ${vendor.email}`);

    doc.fontSize(10);
    doc.font(`Helvetica-Bold`);
    doc.text(`Ship To:`, ((docWidth / 2) + 15), 175);

    doc.fontSize(12);
    doc.font(`Helvetica-Bold`);
    doc.text(`${shipTo.company}`, ((docWidth / 2) + 15), 192);
    doc.fontSize(9);
    doc.font(`Helvetica`);
    if (shipTo.addressTwo === '') {
        doc.text(`${shipTo.addressOne}`);
    } else {
        doc.text(`${shipTo.addressOne} - ${shipTo.addressTwo}`);
    }
    doc.text(`${shipTo.city} ${shipTo.state} ${shipTo.postal}`);
    doc.text(`(p): ${shipTo.phone}`);
    doc.text(`(e): ${shipTo.email}`);

    const table = {
        title: '',
        headers: [
            {label: `Item Id`, property: `itemId`, width: 70},
            {label: `Quantity`, property: `quantity`, width: 70, align: 'center'},
            {label: `Description`, property: `itemDescription`, width: ((docWidth - 100) - (70 * 4))},
            {label: `Price`, property: `unitValue`, width: 70, align: 'right'},
            {label: `Line Total`, property: `lineTotal`, width: 70, align: 'right'},
        ],
        rows: [],
        datas: order.lineItems
    }

    doc.table(table, { width: (docWidth - 50), x: 50, y: 273 });

    const subTotals = [];

    order.lineItems.forEach((line) => {
        subTotals.push(Number(line.lineTotal));
    });

    let currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CAD' });

    const subTotal = subTotals.reduce((a, b) => a + b, 0);
    const gst = (Number(subTotal) * (Number(taxes.GST) / 100));
    const pst = (Number(subTotal) * (Number(taxes.PST) / 100));
    const total = Number(subTotal) + Number(gst) + Number(pst);

    doc.fontSize(10);
    doc.font(`Helvetica-Bold`);
    doc.text(`Notes:`, 48, (docHeight - 95));
    doc.fontSize(8);
    doc.text(`${order.notes}`, 48, (docHeight - 80), {align: 'left', width: (docWidth / 2)});

    doc.fontSize(9);
    doc.font(`Helvetica`);
    doc.text(`Sub Total:`, ((docWidth / 2) + 60), (docHeight - 95));
    doc.text(`PST @ ${taxes.PST}%:`, ((docWidth / 2) + 60), (docHeight - 80));
    doc.text(`GST @ ${taxes.GST}%:`, ((docWidth / 2) + 60), (docHeight - 65));
    doc.text(`Total: ${order.currency}`, ((docWidth / 2) + 60), (docHeight - 40));

    doc.text(`${currency.format(subTotal).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 95), {align: 'right'});
    doc.text(`${currency.format(pst).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 80), {align: 'right'});
    doc.text(`${currency.format(gst).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 65), {align: 'right'});
    doc.text(`${currency.format(total).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 40), {align: 'right'});

    doc.end();
}

function buildLogisticsCallSheet(dataCallback, endCallback, quote, customer, shipper, consignee) {
    const doc = new PDFDocument({ size: 'Letter', margins: { left: 35, right: 35, bottom: 5 } });

    const docWidth = 612;
    const docHeight = 792;

    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    doc.fontSize(11);
    doc.font('Helvetica-Bold');
    doc.text(`Name:`, 35, 45);

    doc.fontSize(26);
    doc.fillColor(`red`).text(`Booking Ticket`, (docWidth / 2), 30, {align: 'right'});
    
    doc.fontSize(11);
    doc.fillColor('#242424')
    doc.font('Helvetica');
    doc.text(`${quote.quoteTaker}`, 85, 45);
    doc.strokeColor('#ccc').moveTo(83, 55).lineTo(((docWidth / 2) - 25), 55).stroke();

    doc.font('Helvetica-Bold');
    doc.text(`Export`, 35, 75);
    if (quote.importExport === 'export') {
        doc.roundedRect(33, 72, 40, 15, 2).strokeColor('#242424').stroke();
    }
    doc.font('Helvetica');
    doc.text(`or`, 75, 75);
    doc.font('Helvetica-Bold');
    doc.text(`Import`, 90, 75);
    if (quote.importExport === 'import') {
        doc.roundedRect(87, 72, 40, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`FTL`, ((docWidth / 2) - 110), 75);
    if (quote.freightSize === 'FTL') {
        doc.roundedRect(((docWidth / 2) - 113), 72, 26, 15, 2).strokeColor('#242424').stroke();
    }
    doc.font('Helvetica');
    doc.text(`or`, ((docWidth / 2) - 85), 75);
    doc.font('Helvetica-Bold');
    doc.text(`LTL`, ((docWidth / 2) - 70), 75);
    if (quote.freightSize === 'LTL') {
        doc.roundedRect(((docWidth / 2) - 73), 72, 26, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`Domestic`, ((docWidth / 2) + 10), 75);
    if (quote.shipmentType === 'Domestic') {
        doc.roundedRect(((docWidth / 2) + 8), 72, 54, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, ((docWidth / 2) + 65), 75);
    doc.text(`Transborder`, ((docWidth / 2) + 75), 75);
    if (quote.shipmentType === 'Transborder') {
        doc.roundedRect(((docWidth / 2) + 73), 72, 67, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, ((docWidth / 2) + 145), 75);
    doc.text(`Interstate`, ((docWidth / 2) + 155), 75);
    if (quote.shipmentType === 'Interstate') {
        doc.roundedRect(((docWidth / 2) + 153), 72, 53, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, ((docWidth / 2) + 210), 75);
    doc.text(`Intrastate`, ((docWidth / 2) + 220), 75);
    if (quote.shipmentType === 'IntraState') {
        doc.roundedRect(((docWidth / 2) + 218), 72, 53, 15, 2).strokeColor('#242424').stroke();
    }

    doc.text(`Client / Bill To:`, 35, 105);
    doc.font('Helvetica');
    doc.text(`${customer.company}`, 115, 105);
    doc.strokeColor('#ccc').moveTo(113, 115).lineTo(((docWidth / 2) - 15), 115).stroke();

    doc.font('Helvetica-Bold');
    doc.text(`Date:`, ((docWidth / 2)), 105);
    doc.text(`Time:`, ((docWidth / 2) + 135), 105);
    doc.font('Helvetica');
    doc.text(`${quote.quoteDate.date}`,((docWidth / 2) + 45), 105);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 35 ), 115).lineTo(((docWidth / 2) + 130), 115).stroke();
    doc.text(`${quote.quoteDate.time}`, ((docWidth / 2) + 180), 105);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 170 ), 115).lineTo((docWidth - 35), 115).stroke();

    doc.font('Helvetica-Bold');
    doc.text(`GTS Bill of Lading:`, (docWidth / 2), 125);
    doc.text(`Quote:`, (docWidth / 2), 140);
    doc.text(`Freight:`, (docWidth / 2), 155);
    doc.text(`3rd Party Billing To:`, (docWidth / 2), 185);
    doc.text(`HAZARDOUS GOODS - DG`, (docWidth / 2), 200);
    doc.text(`UN #:`, (docWidth / 2), 215);
    doc.text(`Class #:`, ((docWidth / 2) + 80), 215);
    doc.text(`PG #:`, ((docWidth / 2) + 175), 215);
    doc.text(`Description:`, (docWidth / 2), 230);
    doc.text(`Emergency #:`, (docWidth / 2), 245);

    doc.font('Helvetica');
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 108 ), 135).lineTo((docWidth - 35), 135).stroke();
    doc.text(`${quote.quoteNumber}`, ((docWidth / 2) + 110), 140);
    doc.text(`PPD`, ((docWidth / 2) + 110), 155);
    if (quote.paymentTerms === 'PPD') {
        doc.roundedRect(((docWidth / 2) + 108), 153, 26, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, ((docWidth / 2) + 140), 155);
    doc.text(`COL`, ((docWidth / 2) + 150), 155);
    if (quote.paymentTerms === 'COL') {
        doc.roundedRect(((docWidth / 2) + 148), 153, 26, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, ((docWidth / 2) + 180), 155);
    doc.text(`TP`, ((docWidth / 2) + 190), 155);
    if (quote.paymentTerms === 'TP') {
        doc.roundedRect(((docWidth / 2) + 188), 153, 18, 15, 2).strokeColor('#242424').stroke();
    }
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 108 ), 150).lineTo((docWidth - 35), 150).stroke();
    doc.text(`${quote.thirdPartyInformation}`, ((docWidth / 2) + 110), 185);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 108 ), 195).lineTo((docWidth - 35), 195).stroke();
    doc.text(`${quote.dangerousGoods.un}`, ((docWidth / 2) + 35), 215);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 33 ), 225).lineTo(((docWidth / 2) + 70), 225).stroke();
    doc.text(`${quote.dangerousGoods.class}`, ((docWidth / 2) + 130), 215);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 128), 225).lineTo(((docWidth / 2) + 165), 225).stroke();
    doc.text(`${quote.dangerousGoods.pg}`, ((docWidth / 2) + 210), 215);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 208), 225).lineTo(((docWidth / 2) + 245), 225).stroke();
    
    doc.text(`${quote.dangerousGoods.dgDescription}`, ((docWidth / 2) + 80), 230);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 78 ), 240).lineTo((docWidth - 35), 240).stroke();
    doc.text(`${quote.dangerousGoods.emergencyContact}`, ((docWidth / 2) + 80), 245);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 78), 255).lineTo((docWidth - 35), 255).stroke();

    doc.font('Helvetica-Bold');
    doc.text(`Shipper:`, 35, 140);
    doc.font('Helvetica');
    doc.text(`${shipper.company}`, 105, 140);
    doc.strokeColor('#ccc').moveTo(103, 150).lineTo(((docWidth / 2) - 15), 150).stroke();
    if (shipper.addressTwo === null || shipper.addressTwo === '') {
        doc.text(`${shipper.addressOne}`, 105, 155);
        doc.strokeColor('#ccc').moveTo(33, 165).lineTo(((docWidth / 2) - 15), 165).stroke();
    } else {
        doc.text(`${shipper.addressOne} - ${shipper.addressTwo}`, 105, 155);
        doc.strokeColor('#ccc').moveTo(33, 165).lineTo(((docWidth / 2) - 15), 165).stroke();
    }
    doc.text(`${shipper.city}. ${shipper.state}.`, 105, 170);
    doc.strokeColor('#ccc').moveTo(33, 180).lineTo(((docWidth / 2) - 15), 180).stroke();
    doc.strokeColor('#ccc').moveTo(33, 195).lineTo(((docWidth / 2) - 15), 195).stroke();

    doc.font('Helvetica-Bold');
    doc.text(`Consignee:`, 35, 200);
    doc.font('Helvetica');
    doc.text(`${consignee.company}`, 105, 200);
    doc.strokeColor('#ccc').moveTo(103, 210).lineTo(((docWidth / 2) - 15), 210).stroke();
    if (consignee.addressTwo === null || consignee.addressTwo === '') {
        doc.text(`${consignee.addressOne}`, 105, 215);
        doc.strokeColor('#ccc').moveTo(33, 225).lineTo(((docWidth / 2) - 15), 225).stroke();
    } else {
        doc.text(`${consignee.addressOne} = ${consignee.addressTwo}`, 105, 215)
        doc.strokeColor('#ccc').moveTo(33, 225).lineTo(((docWidth / 2) - 15), 225).stroke();
    }
    doc.text(`${consignee.city}. ${consignee.state}.`, 105, 230);
    doc.strokeColor('#ccc').moveTo(33, 240).lineTo(((docWidth / 2) - 15), 240).stroke();
    doc.strokeColor('#ccc').moveTo(33, 255).lineTo(((docWidth / 2) - 15), 255).stroke();
    doc.strokeColor('#242424').moveTo(30, 265).lineTo((docWidth - 30), 265).stroke();

    doc.font('Helvetica-Bold');
    doc.text(`Commodity:`, 35, 275);
    doc.text(`Service Level:`, 35, 290);
    doc.text(`Req. Equip.:`, 35, 305);

    doc.font('Helvetica');
    doc.text(`${quote.commodity}`, 125, 275);
    doc.strokeColor('#ccc').moveTo(123, 285).lineTo(((docWidth / 2) - 15), 285).stroke();
    doc.text(`${quote.serviceLevel}`, 125, 290);
    doc.strokeColor('#ccc').moveTo(123, 300).lineTo(((docWidth / 2) - 15), 300).stroke();

    // Equipment
    doc.text(`DV`, 125, 305);
    if (quote.equipmentRequired.dv) {
        doc.roundedRect(123, 302, 19, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, 145, 305);
    doc.text(`RF`, 155, 305);
    if (quote.equipmentRequired.rf) {
        doc.roundedRect(153, 302, 19, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, 175, 305);
    doc.text(`DU`, 185, 305);
    if (quote.equipmentRequired.du) {
        doc.roundedRect(183, 302, 19, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, 205, 305);
    doc.text(`RL`, 215, 305);
    if (quote.equipmentRequired.rl) {
        doc.roundedRect(213, 302, 19, 15, 2).strokeColor('#242424').stroke();
    }

    doc.text(`FD`, 125, 325);
    if (quote.equipmentRequired.fd) {
        doc.roundedRect(123, 322, 19, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, 145, 325);
    doc.text(`SD`, 155, 325);
    if (quote.equipmentRequired.sd) {
        doc.roundedRect(153, 322, 19, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, 175, 325);
    doc.text(`SB`, 185, 325);
    if (quote.equipmentRequired.sb) {
        doc.roundedRect(183, 322, 19, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, 205, 325);
    doc.text(`DD`, 215, 325);
    if (quote.equipmentRequired.dd) {
        doc.roundedRect(213, 322, 19, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, 235, 325);
    doc.text(`FU`, 245, 325);
    if (quote.equipmentRequired.fu) {
        doc.roundedRect(243, 322, 19, 15, 2).strokeColor('#242424').stroke();
    }

    // Shipment Dims

    doc.font('Helvetica-Bold');
    doc.text(`Pieces:`, 35 , 355);
    doc.text(`Weight:`, 35, 390);
    doc.strokeColor('#ccc').moveTo(33, 403).lineTo(((docWidth / 2) - 10), 403).stroke();
    doc.text(`CUFT:`, 175, 390);
    doc.text(`Dims:`, 35, 405);
    doc.strokeColor('#ccc').moveTo(33, 415).lineTo(((docWidth / 2) - 10), 415).stroke();

    doc.font('Helvetica');
    doc.text(`${quote.totalPieces}`, 80, 355);
    doc.strokeColor('#ccc').moveTo(78, 365).lineTo(((docWidth / 2) - 15), 365).stroke();
    doc.strokeColor('#ccc').moveTo(78, 380).lineTo(((docWidth / 2) - 15), 380).stroke();
    doc.text(`${quote.totalWeight.weight} ${quote.totalWeight.measurement}. Total`, 80, 390);
    doc.strokeColor('#ccc').moveTo(78, 400).lineTo(170, 400).stroke();
    doc.text(`${quote.shipmentDims.totalCuft} Total`, 215, 390);
    doc.strokeColor('#ccc').moveTo(213, 400).lineTo(((docWidth / 2) - 10), 400).stroke();
    doc.fontSize(8.5);
    if (quote.shipmentDims.row1.l != '') {
        doc.text(`${quote.shipmentDims.row1.l}"`, 37, 421);
        doc.text(`${quote.shipmentDims.row1.w}"`, 71, 421);
        doc.text(`${quote.shipmentDims.row1.h}"`, 106, 421);
        doc.text(`${quote.shipmentDims.row1.c}`, 142, 421);
    } 
    if (quote.shipmentDims.row2.l != '') {
        doc.text(`${quote.shipmentDims.row2.l}"`, 172, 421);
        doc.text(`${quote.shipmentDims.row2.w}"`, 207, 421);
        doc.text(`${quote.shipmentDims.row2.h}"`, 242, 421);
        doc.text(`${quote.shipmentDims.row2.c}`, 277, 421);
    }
    doc.strokeColor('#ccc').moveTo(33, 433).lineTo(((docWidth / 2) - 10), 433).stroke();
    doc.strokeColor('#ccc').moveTo(33, 437).lineTo(((docWidth / 2) - 10), 437).stroke();
    if (quote.shipmentDims.row3.l != '') {
        doc.text(`${quote.shipmentDims.row3.l}"`, 37, 446);
        doc.text(`${quote.shipmentDims.row3.w}"`, 71, 446);
        doc.text(`${quote.shipmentDims.row3.h}"`, 106, 446);
        doc.text(`${quote.shipmentDims.row3.c}`, 142, 446);
    } 
    if (quote.shipmentDims.row4.l != '') {
        doc.text(`${quote.shipmentDims.row4.l}"`, 172, 446);
        doc.text(`${quote.shipmentDims.row4.w}"`, 207, 446);
        doc.text(`${quote.shipmentDims.row4.h}"`, 242, 446);
        doc.text(`${quote.shipmentDims.row4.c}`, 277, 446);
    }
    doc.strokeColor('#ccc').moveTo(33, 458).lineTo(((docWidth / 2) - 10), 458).stroke();
    doc.strokeColor('#ccc').moveTo(33, 462).lineTo(((docWidth / 2) - 10), 462).stroke();
    if (quote.shipmentDims.row5.l != '') {
        doc.text(`${quote.shipmentDims.row5.l}"`, 37, 471);
        doc.text(`${quote.shipmentDims.row5.w}"`, 71, 471);
        doc.text(`${quote.shipmentDims.row5.h}"`, 106, 471);
        doc.text(`${quote.shipmentDims.row5.c}`, 142, 471);
    } 
    if (quote.shipmentDims.row6.l != '') {
        doc.text(`${quote.shipmentDims.row6.l}"`, 172, 471);
        doc.text(`${quote.shipmentDims.row6.w}"`, 207, 471);
        doc.text(`${quote.shipmentDims.row6.h}"`, 242, 471);
        doc.text(`${quote.shipmentDims.row6.c}`, 277, 471);
    }
    doc.strokeColor('#ccc').moveTo(33, 483).lineTo(((docWidth / 2) - 10), 483).stroke();
    doc.strokeColor('#ccc').moveTo(33, 487).lineTo(((docWidth / 2) - 10), 487).stroke();
    if (quote.shipmentDims.row7.l != '') {
        doc.text(`${quote.shipmentDims.row7.l}"`, 37, 496);
        doc.text(`${quote.shipmentDims.row7.w}"`, 71, 496);
        doc.text(`${quote.shipmentDims.row7.h}"`, 106, 496);
        doc.text(`${quote.shipmentDims.row7.c}`, 142, 496);
    } 
    if (quote.shipmentDims.row8.l != '') {
        doc.text(`${quote.shipmentDims.row8.l}"`, 172, 496);
        doc.text(`${quote.shipmentDims.row8.w}"`, 207, 496);
        doc.text(`${quote.shipmentDims.row8.h}"`, 242, 496);
        doc.text(`${quote.shipmentDims.row8.c}`, 277, 496);
    }
    doc.strokeColor('#ccc').moveTo(33, 508).lineTo(((docWidth / 2) - 10), 508).stroke();
    doc.strokeColor('#ccc').moveTo(33, 512).lineTo(((docWidth / 2) - 10), 512).stroke();
    if (quote.shipmentDims.row9.l != '') {
        doc.text(`${quote.shipmentDims.row9.l}"`, 37, 521);
        doc.text(`${quote.shipmentDims.row9.w}"`, 71, 521);
        doc.text(`${quote.shipmentDims.row9.h}"`, 106, 521);
        doc.text(`${quote.shipmentDims.row9.c}`, 142, 521);
    } 
    if (quote.shipmentDims.row10.l != '') {
        doc.text(`${quote.shipmentDims.row10.l}"`, 172, 521);
        doc.text(`${quote.shipmentDims.row10.w}"`, 207, 521);
        doc.text(`${quote.shipmentDims.row10.h}"`, 242, 521);
        doc.text(`${quote.shipmentDims.row10.c}`, 277, 521);
    }
    doc.strokeColor('#ccc').moveTo(33, 533).lineTo(((docWidth / 2) - 10), 533).stroke();
    doc.strokeColor('#ccc').moveTo(33, 537).lineTo(((docWidth / 2) - 10), 537).stroke();
    
    doc.strokeColor('#ccc').moveTo(33, 403).lineTo(33, 537).stroke();
    doc.strokeColor('#ccc').moveTo(59, 415).lineTo(59, 537).stroke();
    doc.text(`x`, 61, 420);
    doc.text(`x`, 61, 445);
    doc.text(`x`, 61, 470);
    doc.text(`x`, 61, 495);
    doc.text(`x`, 61, 520);
    doc.strokeColor('#ccc').moveTo(68, 415).lineTo(68, 537).stroke();
    doc.strokeColor('#ccc').moveTo(94, 415).lineTo(94, 537).stroke();
    doc.text(`x`, 96, 420);
    doc.text(`x`, 96, 445);
    doc.text(`x`, 96, 470);
    doc.text(`x`, 96, 495);
    doc.text(`x`, 96, 520);
    doc.strokeColor('#ccc').moveTo(103, 415).lineTo(103, 537).stroke();
    doc.strokeColor('#ccc').moveTo(129, 415).lineTo(129, 537).stroke();
    doc.fontSize(6);
    doc.text(`@`, 130, 421);
    doc.text(`@`, 130, 446);
    doc.text(`@`, 130, 471);
    doc.text(`@`, 130, 496);
    doc.text(`@`, 130, 521);
    doc.strokeColor('#ccc').moveTo(138, 415).lineTo(138, 537).stroke();
    doc.strokeColor('#ccc').moveTo(163, 403).lineTo(163, 537).stroke();

    doc.strokeColor('#ccc').moveTo(168, 403).lineTo(168, 537).stroke();
    doc.strokeColor('#ccc').moveTo(194, 415).lineTo(194, 537).stroke();
    doc.fontSize(8.5);
    doc.text(`x`, 196, 420);
    doc.text(`x`, 196, 445);
    doc.text(`x`, 196, 470);
    doc.text(`x`, 196, 495);
    doc.text(`x`, 196, 520);
    doc.strokeColor('#ccc').moveTo(203, 415).lineTo(203, 537).stroke();
    doc.strokeColor('#ccc').moveTo(229, 415).lineTo(229, 537).stroke();
    doc.text(`x`, 231, 420);
    doc.text(`x`, 231, 445);
    doc.text(`x`, 231, 470);
    doc.text(`x`, 231, 495);
    doc.text(`x`, 231, 520);
    doc.strokeColor('#ccc').moveTo(238, 415).lineTo(238, 537).stroke();
    doc.strokeColor('#ccc').moveTo(264, 415).lineTo(264, 537).stroke();
    doc.fontSize(6);
    doc.text(`@`, 265, 421);
    doc.text(`@`, 265, 446);
    doc.text(`@`, 265, 471);
    doc.text(`@`, 265, 496);
    doc.text(`@`, 265, 521);
    doc.strokeColor('#ccc').moveTo(273, 415).lineTo(273, 537).stroke();

    doc.strokeColor('#ccc').moveTo(((docWidth / 2) - 10), 403).lineTo(((docWidth / 2) - 10), 537).stroke();
    
    doc.font('Helvetica-Bold');
    doc.fontSize(11);
    doc.text(`Stackable`, 35, 550);
    if (quote.stackable === 'Non-Stackable') {
        doc.roundedRect(108, 547, 85, 15, 2).strokeColor('#242424').stroke();
    } else {
        doc.roundedRect(33, 547, 55, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`//`, 95, 550);
    doc.text(`Non - Stackable`, 110, 550);
    doc.text(`Freight Ready:`, 35, 580);
    doc.text(`Pick-up Appt.:`, 35, 595);
    doc.text(`PO:`, 35, 610);
    doc.text(`Team Drivers Required:`, 35, 625);
    doc.text(`SB Customs Broker:`, 35, 640);

    doc.strokeColor('#242424').moveTo(33, 653).lineTo((docWidth - 30), 653).stroke();
    doc.strokeColor('#242424').moveTo(33, 653).lineTo(33, 760).stroke();
    doc.strokeColor('#242424').moveTo((docWidth - 30), 653).lineTo((docWidth - 30), 760).stroke();
    doc.text(`Shipment Control Check List`, 35, 655, {align: 'center'});
    doc.strokeColor('#242424').moveTo(33, 667).lineTo((docWidth - 30), 667).stroke();
    doc.strokeColor('#242424').moveTo(33, 760).lineTo((docWidth - 30), 760).stroke();

    doc.font('Helvetica-Bold');
    doc.text(`Rate Con. Sent:`, 35, 670);
    doc.text(`BOL Sent:`, 35, 685);
    doc.text(`Truck:`, 35, 700);
    doc.text(`Border:`, 35, 715);
    doc.text(`PARS/PAPS:`, 35, 730);
    doc.text(`Entry #:`, 35, 745);

    doc.strokeColor('#ccc').moveTo(123, 680).lineTo(((docWidth / 2) - 15), 680).stroke();
    doc.strokeColor('#ccc').moveTo(123, 695).lineTo(((docWidth / 2) - 15), 695).stroke();
    doc.strokeColor('#ccc').moveTo(123, 710).lineTo(((docWidth / 2) - 15), 710).stroke();
    doc.strokeColor('#ccc').moveTo(123, 725).lineTo(((docWidth / 2) - 15), 725).stroke();
    doc.strokeColor('#ccc').moveTo(123, 740).lineTo(((docWidth / 2) - 15), 740).stroke();
    doc.strokeColor('#ccc').moveTo(123, 755).lineTo(((docWidth / 2) - 15), 755).stroke();

    doc.font('Helvetica-Bold');
    doc.text(`Special Notes:`, (docWidth / 2), 670);
    doc.text(`PARS/PAPS Accepted?:`, (docWidth / 2), 745);

    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 680).lineTo((docWidth - 35), 680).stroke();
    doc.strokeColor('#ccc').moveTo((docWidth / 2), 695).lineTo((docWidth - 35), 695).stroke();
    doc.strokeColor('#ccc').moveTo((docWidth / 2), 710).lineTo((docWidth - 35), 710).stroke();
    doc.strokeColor('#ccc').moveTo((docWidth / 2), 725).lineTo((docWidth - 35), 725).stroke();
    doc.strokeColor('#ccc').moveTo((docWidth / 2), 740).lineTo((docWidth - 35), 740).stroke();
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 133), 755).lineTo((docWidth - 35), 755).stroke();

    doc.font('Helvetica');
    doc.text(`${quote.freightReady}`, 125, 580);
    doc.strokeColor('#ccc').moveTo(123, 590).lineTo(((docWidth / 2) - 15), 590).stroke();
    doc.text(`${quote.pickupAppointment}`, 125, 595);
    doc.strokeColor('#ccc').moveTo(123, 605).lineTo(((docWidth / 2) - 15), 605).stroke();
    doc.text(`Yes`, 185, 625);
    if (quote.teamRequired) {
        doc.roundedRect(183, 622, 22, 15, 2).strokeColor('#242424').stroke();
    } else {
        doc.roundedRect(223, 622, 21, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`or`, 208, 625);
    doc.text(`No`, 225, 625);
    doc.text(`${quote.broker.sb}`, 150, 640);
    doc.strokeColor('#ccc').moveTo(148, 650).lineTo(((docWidth / 2) - 15), 650).stroke();

    doc.font('Helvetica-Bold');
    doc.fontSize(11);
    doc.text(`Power Tail Gate:`, (docWidth / 2), 275);
    doc.text(`Tarp Required:`, (docWidth / 2), 290);
    doc.text(`ETA:`, (docWidth / 2) , 320);
    doc.text(`Del. Appt:`, (docWidth / 2), 355);
    doc.text(`Carrier:`, (docWidth / 2), 390);
    doc.text(`Dispatch Time:`, (docWidth / 2), 405);
    doc.text(`Pick-up Date:`, (docWidth / 2), 420);
    doc.text(`Carrier Equip.:`, (docWidth / 2), 435);
    doc.text(`Quote Number:`, (docWidth / 2), 450);
    doc.text(`Carrier Rate:`, (docWidth / 2), 480);
    doc.text(`Client Rate:`, (docWidth / 2), 555);
    doc.text(`NB Customs Broker:`, (docWidth / 2), 640);

    doc.font('Helvetica');
    if (quote.tailgate) {
        doc.roundedRect(((docWidth / 2) + 128), 273, 22, 13, 2).strokeColor('#242424').stroke();
    } else {
        doc.roundedRect(((docWidth / 2) + 163), 273, 20, 13, 2).strokeColor('#242424').stroke();
    }
    doc.text(`Yes`, ((docWidth / 2) + 130), 275);
    doc.text(`/`, ((docWidth / 2) + 155), 275);
    doc.text(`No`, ((docWidth / 2) + 165), 275);
    doc.text(`${quote.deliveryEta}`, ((docWidth / 2) + 85), 320);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 330).lineTo((docWidth - 35), 330).stroke();
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 345).lineTo((docWidth - 35), 345).stroke();
    doc.text(`${quote.deliveryAppointment}`, ((docWidth / 2) + 85), 355);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 365).lineTo((docWidth - 35), 365).stroke();
    
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 400).lineTo((docWidth - 35), 400).stroke();
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 415).lineTo((docWidth - 35), 415).stroke();
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 430).lineTo((docWidth - 35), 430).stroke();
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 445).lineTo((docWidth - 35), 445).stroke();
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 460).lineTo((docWidth - 35), 460).stroke();

    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 490).lineTo((docWidth - 35), 490).stroke();
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 505).lineTo((docWidth - 35), 505).stroke();
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 520).lineTo((docWidth - 35), 520).stroke();
    doc.strokeColor('#242424').moveTo(((docWidth / 2) + 83), 535).lineTo((docWidth - 35), 535).stroke();
    doc.strokeColor('#242424').moveTo(((docWidth / 2) + 83), 550).lineTo((docWidth - 35), 550).stroke();

    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 565).lineTo((docWidth - 35), 565).stroke();
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 580).lineTo((docWidth - 35), 580).stroke();
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 595).lineTo((docWidth - 35), 595).stroke();
    doc.strokeColor('#242424').moveTo(((docWidth / 2) + 83), 610).lineTo((docWidth - 35), 610).stroke();
    doc.strokeColor('#242424').moveTo(((docWidth / 2) + 83), 625).lineTo((docWidth - 35), 625).stroke();
    doc.text(`${quote.broker.nb}`, ((docWidth / 2) + 115), 640);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 113), 650).lineTo((docWidth - 35), 650).stroke();
    
    doc.text(`Yes`, ((docWidth / 2) + 130), 290);
    doc.text(`/`, ((docWidth / 2) + 155), 290);
    doc.text(`No`, ((docWidth / 2) + 165), 290);
    if (quote.tarp) {
        doc.roundedRect(((docWidth / 2) + 128), 287, 22, 13, 2).strokeColor('#242424').stroke();
    } else {
        doc.roundedRect(((docWidth / 2) + 163), 287, 20, 13, 2).strokeColor('#242424').stroke();
    }
    doc.end();
}


module.exports = { buildPurchaseOrder, buildInvoice, buildLogisticsCallSheet }