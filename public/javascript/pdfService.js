const PDFDocument = require('pdfkit-table')

function buildInvoice(dataCallback, endCallback, invoice, owner, soldTo, shipTo, taxes) {
    const doc = new PDFDocument({ size: 'Letter', margins: { left: 45, right: 55, bottom: 5 } });

    doc.registerFont('Heading Font', 'public/fonts/Dosis-SemiBold.ttf');
    doc.registerFont('Body Font', 'public/fonts/Dosis-Light.ttf');

    const docWidth = 612;
    const docHeight = 792;

    doc.on('data', dataCallback);
    doc.on('end', endCallback);
    
    doc.fontSize(20);
    doc.font('Heading Font');
    doc.text(`${owner.company}`, 50, 70);
    doc.font('Body Font');   
    doc.fontSize(10);
    doc.text(`${owner.addressOne}`, 50, 100);
    doc.text(`${owner.city} ${owner.state} ${owner.postal}`);
    doc.text(`(c): ${owner.phone}`);
    doc.text(`(e): ${owner.email}`);

    doc.fontSize(20);
    doc.font('Heading Font');
    doc.fillColor('red');
    doc.text(`Invoice`, 351, 50, { align: 'right' });
    doc.fillColor('black');
    doc.font('Body Font');
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
    doc.font(`Heading Font`);
    doc.text(`Sold To:`, 60, 175);
    
    doc.fontSize(12);
    doc.font(`Heading Font`);
    doc.text(`${soldTo.company}`, 60, 192);
    doc.fontSize(9);
    doc.font('Body Font');
    if (soldTo.addressTwo === '') {
        doc.text(`${soldTo.addressOne}`);
    } else {
        doc.text(`${soldTo.addressOne} - ${soldTo.addressTwo}`);
    }
    doc.text(`${soldTo.city} ${soldTo.state} ${soldTo.postal}`);
    doc.text(`(p): ${soldTo.phone}`);
    doc.text(`(e): ${soldTo.email}`);

    doc.fontSize(10);
    doc.font(`Heading Font`);
    doc.text(`Ship To:`, ((docWidth / 2) + 15), 175);

    doc.fontSize(12);
    doc.font(`Heading Font`);
    doc.text(`${shipTo.company}`, ((docWidth / 2) + 15), 192);
    doc.fontSize(9);
    doc.font(`Body Font`);
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

    doc.font(`Heading Font`);
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
    doc.font(`Heading Font`);
    doc.text(`Notes:`, 48, (docHeight - 110));
    doc.fontSize(8);
    doc.text(`${invoice.notes}`, 48, (docHeight - 92), {align: 'left', width: (docWidth / 2)});

    doc.fontSize(9);
    doc.font(`Body Font`);
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

    doc.registerFont('Heading Font', 'public/fonts/Dosis-SemiBold.ttf');
    doc.registerFont('Body Font', 'public/fonts/Dosis-Light.ttf');

    const docWidth = 612;
    const docHeight = 792;

    doc.on('data', dataCallback);
    doc.on('end', endCallback);
    
    doc.fontSize(20);
    doc.font('Heading Font');
    doc.text(`${soldTo.company}`, 50, 70); buildPurchaseOrder
    doc.font('Body Font');   
    doc.fontSize(10);
    doc.text(`${soldTo.addressOne}`, 50, 100);
    doc.text(`${soldTo.city} ${soldTo.state} ${soldTo.postal}`);
    doc.text(`(c): ${soldTo.phone}`);
    doc.text(`(e): ${soldTo.email}`);

    doc.fontSize(20);
    doc.font('Heading Font');
    doc.fillColor('red');
    doc.text(`Purchase Order`, 351, 50, { align: 'right' });
    doc.fillColor('black');
    doc.font('Body Font');
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
    doc.font(`Heading Font`);
    doc.text(`Vendor:`, 60, 175);
    
    doc.fontSize(12);
    doc.font(`Heading Font`);
    doc.text(`${vendor.company}`, 60, 192);
    doc.fontSize(9);
    doc.font('Body Font');
    if (vendor.addressTwo === '') {
        doc.text(`${vendor.addressOne}`);
    } else {
        doc.text(`${vendor.addressOne} - ${vendor.addressTwo}`);
    }
    doc.text(`${vendor.city} ${vendor.state} ${vendor.postal}`);
    doc.text(`(p): ${vendor.phone}`);
    doc.text(`(e): ${vendor.email}`);

    doc.fontSize(10);
    doc.font(`Heading Font`);
    doc.text(`Ship To:`, ((docWidth / 2) + 15), 175);

    doc.fontSize(12);
    doc.font(`Heading Font`);
    doc.text(`${shipTo.company}`, ((docWidth / 2) + 15), 192);
    doc.fontSize(9);
    doc.font(`Body Font`);
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
    doc.font(`Heading Font`);
    doc.text(`Notes:`, 48, (docHeight - 95));
    doc.fontSize(8);
    doc.text(`${order.notes}`, 48, (docHeight - 80), {align: 'left', width: (docWidth / 2)});

    doc.fontSize(9);
    doc.font(`Body Font`);
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

    doc.registerFont('Heading Font', 'public/fonts/Dosis-SemiBold.ttf');
    doc.registerFont('Body Font', 'public/fonts/Dosis-Light.ttf');

    const docWidth = 612;
    const docHeight = 792;

    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    doc.fontSize(11);
    doc.font('Heading Font');
    doc.text(`Name:`, 35, 45);

    doc.fontSize(26);
    doc.fillColor(`red`).text(`Booking Ticket`, (docWidth / 2), 30, {align: 'right'});
    
    doc.fontSize(11);
    doc.fillColor('#242424')
    doc.font('Body Font');
    doc.text(`${quote.quoteTaker}`, 85, 45);
    doc.strokeColor('#ccc').moveTo(83, 58).lineTo(((docWidth / 2) - 25), 58).stroke();

    doc.font('Heading Font');
    doc.text(`Export`, 35, 75);
    if (quote.importExport === 'export') {
        doc.roundedRect(33, 75, 40, 15, 2).strokeColor('#242424').stroke();
    }
    doc.font('Body Font');
    doc.text(`or`, 75, 75);
    doc.font('Heading Font');
    doc.text(`Import`, 90, 75);
    if (quote.importExport === 'import') {
        doc.roundedRect(87, 75, 40, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`FTL`, ((docWidth / 2) - 110), 75);
    if (quote.freightSize === 'FTL') {
        doc.roundedRect(((docWidth / 2) - 113), 75, 26, 15, 2).strokeColor('#242424').stroke();
    }
    doc.font('Body Font');
    doc.text(`or`, ((docWidth / 2) - 85), 75);
    doc.font('Heading Font');
    doc.text(`LTL`, ((docWidth / 2) - 70), 75);
    if (quote.freightSize === 'LTL') {
        doc.roundedRect(((docWidth / 2) - 73), 75, 26, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`Domestic`, ((docWidth / 2) + 10), 75);
    if (quote.shipmentType === 'Domestic') {
        doc.roundedRect(((docWidth / 2) + 8), 75, 54, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, ((docWidth / 2) + 65), 75);
    doc.text(`Transborder`, ((docWidth / 2) + 75), 75);
    if (quote.shipmentType === 'Transborder') {
        doc.roundedRect(((docWidth / 2) + 73), 75, 67, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, ((docWidth / 2) + 145), 75);
    doc.text(`Interstate`, ((docWidth / 2) + 155), 75);
    if (quote.shipmentType === 'Interstate') {
        doc.roundedRect(((docWidth / 2) + 153), 75, 53, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, ((docWidth / 2) + 210), 75);
    doc.text(`Intrastate`, ((docWidth / 2) + 220), 75);
    if (quote.shipmentType === 'IntraState') {
        doc.roundedRect(((docWidth / 2) + 218), 75, 53, 15, 2).strokeColor('#242424').stroke();
    }

    doc.text(`Client / Bill To:`, 35, 105);
    doc.font('Body Font');
    doc.text(`${customer.company}`, 115, 105);
    doc.strokeColor('#ccc').moveTo(113, 118).lineTo(((docWidth / 2) - 15), 118).stroke();

    doc.font('Heading Font');
    doc.text(`Date:`, ((docWidth / 2)), 105);
    doc.text(`Time:`, ((docWidth / 2) + 135), 105);
    doc.font('Body Font');
    doc.text(`${quote.quoteDate.date}`,((docWidth / 2) + 45), 105);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 35 ), 118).lineTo(((docWidth / 2) + 130), 118).stroke();
    doc.text(`${quote.quoteDate.time}`, ((docWidth / 2) + 180), 105);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 170 ), 118).lineTo((docWidth - 35), 118).stroke();

    doc.font('Heading Font');
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

    doc.font('Body Font');
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 108), 138).lineTo((docWidth - 35), 138).stroke();
    doc.text(`${quote.quoteNumber}`, ((docWidth / 2) + 110), 140);
    doc.text(`PPD`, ((docWidth / 2) + 110), 155);
    if (quote.paymentTerms === 'PPD') {
        doc.roundedRect(((docWidth / 2) + 108), 156, 26, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, ((docWidth / 2) + 140), 155);
    doc.text(`COL`, ((docWidth / 2) + 150), 155);
    if (quote.paymentTerms === 'COL') {
        doc.roundedRect(((docWidth / 2) + 148), 156, 26, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, ((docWidth / 2) + 180), 155);
    doc.text(`TP`, ((docWidth / 2) + 190), 155);
    if (quote.paymentTerms === 'TP') {
        doc.roundedRect(((docWidth / 2) + 188), 156, 18, 15, 2).strokeColor('#242424').stroke();
    }
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 108 ), 153).lineTo((docWidth - 35), 153).stroke();
    doc.text(`${quote.thirdPartyInformation}`, ((docWidth / 2) + 110), 185);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 108 ), 198).lineTo((docWidth - 35), 198).stroke();
    doc.text(`${quote.dangerousGoods.un}`, ((docWidth / 2) + 35), 215);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 33 ), 228).lineTo(((docWidth / 2) + 70), 228).stroke();
    doc.text(`${quote.dangerousGoods.class}`, ((docWidth / 2) + 130), 215);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 128), 228).lineTo(((docWidth / 2) + 165), 228).stroke();
    doc.text(`${quote.dangerousGoods.pg}`, ((docWidth / 2) + 210), 215);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 208), 228).lineTo(((docWidth / 2) + 245), 228).stroke();
    
    doc.text(`${quote.dangerousGoods.dgDescription}`, ((docWidth / 2) + 80), 230);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 78 ), 243).lineTo((docWidth - 35), 243).stroke();
    doc.text(`${quote.dangerousGoods.emergencyContact}`, ((docWidth / 2) + 80), 245);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 78), 258).lineTo((docWidth - 35), 258).stroke();

    doc.font('Heading Font');
    doc.text(`Shipper:`, 35, 140);
    doc.font('Body Font');
    doc.text(`${shipper.company}`, 105, 140);
    doc.strokeColor('#ccc').moveTo(103, 153).lineTo(((docWidth / 2) - 15), 153).stroke();
    if (shipper.addressTwo === null || shipper.addressTwo === '') {
        doc.text(`${shipper.addressOne}`, 105, 155);
        doc.strokeColor('#ccc').moveTo(33, 168).lineTo(((docWidth / 2) - 15), 168).stroke();
    } else {
        doc.text(`${shipper.addressOne} - ${shipper.addressTwo}`, 105, 155);
        doc.strokeColor('#ccc').moveTo(33, 168).lineTo(((docWidth / 2) - 15), 168).stroke();
    }
    doc.text(`${shipper.city}. ${shipper.state}.`, 105, 170);
    doc.strokeColor('#ccc').moveTo(33, 183).lineTo(((docWidth / 2) - 15), 183).stroke();
    doc.strokeColor('#ccc').moveTo(33, 198).lineTo(((docWidth / 2) - 15), 198).stroke();

    doc.font('Heading Font');
    doc.text(`Consignee:`, 35, 200);
    doc.font('Body Font');
    doc.text(`${consignee.company}`, 105, 200);
    doc.strokeColor('#ccc').moveTo(103, 213).lineTo(((docWidth / 2) - 15), 213).stroke();
    if (consignee.addressTwo === null || consignee.addressTwo === '') {
        doc.text(`${consignee.addressOne}`, 105, 215);
        doc.strokeColor('#ccc').moveTo(33, 228).lineTo(((docWidth / 2) - 15), 228).stroke();
    } else {
        doc.text(`${consignee.addressOne} = ${consignee.addressTwo}`, 105, 215)
        doc.strokeColor('#ccc').moveTo(33, 228).lineTo(((docWidth / 2) - 15), 228).stroke();
    }
    doc.text(`${consignee.city}. ${consignee.state}.`, 105, 230);
    doc.strokeColor('#ccc').moveTo(33, 243).lineTo(((docWidth / 2) - 15), 243).stroke();
    doc.strokeColor('#ccc').moveTo(33, 258).lineTo(((docWidth / 2) - 15), 258).stroke();
    doc.strokeColor('#242424').moveTo(30, 268).lineTo((docWidth - 30), 268).stroke();

    doc.font('Heading Font');
    doc.text(`Commodity:`, 35, 275);
    doc.text(`Service Level:`, 35, 290);
    doc.text(`Req. Equip.:`, 35, 305);

    doc.font('Body Font');
    doc.text(`${quote.commodity}`, 125, 275);
    doc.strokeColor('#ccc').moveTo(123, 288).lineTo(((docWidth / 2) - 15), 288).stroke();
    doc.text(`${quote.serviceLevel}`, 125, 290);
    doc.strokeColor('#ccc').moveTo(123, 303).lineTo(((docWidth / 2) - 15), 303).stroke();

    // Equipment
    doc.text(`DV`, 125, 305);
    if (quote.equipmentRequired.dv) {
        doc.roundedRect(123, 305, 19, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, 145, 305);
    doc.text(`RF`, 155, 305);
    if (quote.equipmentRequired.rf) {
        doc.roundedRect(153, 305, 19, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, 175, 305);
    doc.text(`DU`, 185, 305);
    if (quote.equipmentRequired.du) {
        doc.roundedRect(183, 305, 19, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, 205, 305);
    doc.text(`RL`, 215, 305);
    if (quote.equipmentRequired.rl) {
        doc.roundedRect(213, 305, 19, 15, 2).strokeColor('#242424').stroke();
    }

    doc.text(`FD`, 125, 325);
    if (quote.equipmentRequired.fd) {
        doc.roundedRect(123, 325, 19, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, 145, 325);
    doc.text(`SD`, 155, 325);
    if (quote.equipmentRequired.sd) {
        doc.roundedRect(153, 325, 19, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, 175, 325);
    doc.text(`SB`, 185, 325);
    if (quote.equipmentRequired.sb) {
        doc.roundedRect(183, 325, 19, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, 205, 325);
    doc.text(`DD`, 215, 325);
    if (quote.equipmentRequired.dd) {
        doc.roundedRect(213, 325, 19, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`/`, 235, 325);
    doc.text(`FU`, 245, 325);
    if (quote.equipmentRequired.fu) {
        doc.roundedRect(243, 325, 19, 15, 2).strokeColor('#242424').stroke();
    }

    // Shipment Dims

    doc.font('Heading Font');
    doc.text(`Pieces:`, 35 , 355);
    doc.text(`Weight:`, 35, 390);
    doc.strokeColor('#ccc').moveTo(33, 406).lineTo(((docWidth / 2) - 10), 406).stroke();
    doc.text(`CUFT:`, 175, 390);
    doc.text(`Dims:`, 35, 405);
    doc.strokeColor('#ccc').moveTo(33, 418).lineTo(((docWidth / 2) - 10), 418).stroke();

    doc.font('Body Font');
    doc.text(`${quote.totalPieces}`, 80, 355);
    doc.strokeColor('#ccc').moveTo(78, 368).lineTo(((docWidth / 2) - 15), 368).stroke();
    doc.strokeColor('#ccc').moveTo(78, 383).lineTo(((docWidth / 2) - 15), 383).stroke();
    doc.text(`${quote.totalWeight.weight} ${quote.totalWeight.measurement}. Total`, 80, 390);
    doc.strokeColor('#ccc').moveTo(78, 403).lineTo(170, 403).stroke();
    doc.text(`${quote.shipmentDims.totalCuft} Total`, 215, 390);
    doc.strokeColor('#ccc').moveTo(213, 403).lineTo(((docWidth / 2) - 10), 403).stroke();
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
    doc.strokeColor('#ccc').moveTo(33, 536).lineTo(((docWidth / 2) - 10), 536).stroke();
    doc.strokeColor('#ccc').moveTo(33, 540).lineTo(((docWidth / 2) - 10), 540).stroke();
    
    doc.strokeColor('#ccc').moveTo(33, 406).lineTo(33, 540).stroke();
    doc.strokeColor('#ccc').moveTo(59, 418).lineTo(59, 540).stroke();
    doc.text(`x`, 61, 420);
    doc.text(`x`, 61, 445);
    doc.text(`x`, 61, 470);
    doc.text(`x`, 61, 495);
    doc.text(`x`, 61, 520);
    doc.strokeColor('#ccc').moveTo(68, 418).lineTo(68, 540).stroke();
    doc.strokeColor('#ccc').moveTo(94, 418).lineTo(94, 540).stroke();
    doc.text(`x`, 96, 420);
    doc.text(`x`, 96, 445);
    doc.text(`x`, 96, 470);
    doc.text(`x`, 96, 495);
    doc.text(`x`, 96, 520);
    doc.strokeColor('#ccc').moveTo(103, 418).lineTo(103, 540).stroke();
    doc.strokeColor('#ccc').moveTo(129, 418).lineTo(129, 540).stroke();
    doc.fontSize(6);
    doc.text(`@`, 130, 421);
    doc.text(`@`, 130, 446);
    doc.text(`@`, 130, 471);
    doc.text(`@`, 130, 496);
    doc.text(`@`, 130, 521);
    doc.strokeColor('#ccc').moveTo(138, 418).lineTo(138, 540).stroke();
    doc.strokeColor('#ccc').moveTo(163, 406).lineTo(163, 540).stroke();

    doc.strokeColor('#ccc').moveTo(168, 406).lineTo(168, 540).stroke();
    doc.strokeColor('#ccc').moveTo(194, 418).lineTo(194, 540).stroke();
    doc.fontSize(8.5);
    doc.text(`x`, 196, 420);
    doc.text(`x`, 196, 445);
    doc.text(`x`, 196, 470);
    doc.text(`x`, 196, 495);
    doc.text(`x`, 196, 520);
    doc.strokeColor('#ccc').moveTo(203, 418).lineTo(203, 540).stroke();
    doc.strokeColor('#ccc').moveTo(229, 418).lineTo(229, 540).stroke();
    doc.text(`x`, 231, 420);
    doc.text(`x`, 231, 445);
    doc.text(`x`, 231, 470);
    doc.text(`x`, 231, 495);
    doc.text(`x`, 231, 520);
    doc.strokeColor('#ccc').moveTo(238, 418).lineTo(238, 540).stroke();
    doc.strokeColor('#ccc').moveTo(264, 418).lineTo(264, 540).stroke();
    doc.fontSize(6);
    doc.text(`@`, 265, 421);
    doc.text(`@`, 265, 446);
    doc.text(`@`, 265, 471);
    doc.text(`@`, 265, 496);
    doc.text(`@`, 265, 521);
    doc.strokeColor('#ccc').moveTo(273, 418).lineTo(273, 540).stroke();

    doc.strokeColor('#ccc').moveTo(((docWidth / 2) - 10), 403).lineTo(((docWidth / 2) - 10), 537).stroke();
    
    doc.font('Heading Font');
    doc.fontSize(11);
    doc.text(`Stackable`, 35, 550);
    if (quote.stackable === 'Non-Stackable') {
        doc.roundedRect(108, 550, 85, 15, 2).strokeColor('#242424').stroke();
    } else {
        doc.roundedRect(33, 550, 55, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`//`, 95, 550);
    doc.text(`Non - Stackable`, 110, 550);
    doc.text(`Freight Ready:`, 35, 580);
    doc.text(`Pick-up Appt.:`, 35, 595);
    doc.text(`PO:`, 35, 610);
    doc.text(`Team Drivers Required:`, 35, 625);
    doc.text(`SB Customs Broker:`, 35, 640);

    doc.strokeColor('#242424').moveTo(33, 656).lineTo((docWidth - 30), 656).stroke();
    doc.strokeColor('#242424').moveTo(33, 656).lineTo(33, 763).stroke();
    doc.strokeColor('#242424').moveTo((docWidth - 30), 656).lineTo((docWidth - 30), 763).stroke();
    doc.text(`Shipment Control Check List`, 35, 655, {align: 'center'});
    doc.strokeColor('#242424').moveTo(33, 670).lineTo((docWidth - 30), 670).stroke();
    doc.strokeColor('#242424').moveTo(33, 763).lineTo((docWidth - 30), 763).stroke();

    doc.font('Heading Font');
    doc.text(`Rate Con. Sent:`, 35, 670);
    doc.text(`BOL Sent:`, 35, 685);
    doc.text(`Truck:`, 35, 700);
    doc.text(`Border:`, 35, 715);
    doc.text(`PARS/PAPS:`, 35, 730);
    doc.text(`Entry #:`, 35, 745);

    doc.strokeColor('#ccc').moveTo(123, 683).lineTo(((docWidth / 2) - 15), 683).stroke();
    doc.strokeColor('#ccc').moveTo(123, 698).lineTo(((docWidth / 2) - 15), 698).stroke();
    doc.strokeColor('#ccc').moveTo(123, 713).lineTo(((docWidth / 2) - 15), 713).stroke();
    doc.strokeColor('#ccc').moveTo(123, 728).lineTo(((docWidth / 2) - 15), 728).stroke();
    doc.strokeColor('#ccc').moveTo(123, 743).lineTo(((docWidth / 2) - 15), 743).stroke();
    doc.strokeColor('#ccc').moveTo(123, 758).lineTo(((docWidth / 2) - 15), 758).stroke();

    doc.font('Heading Font');
    doc.text(`Special Notes:`, (docWidth / 2), 670);
    doc.text(`PARS/PAPS Accepted?:`, (docWidth / 2), 745);

    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 683).lineTo((docWidth - 35), 683).stroke();
    doc.strokeColor('#ccc').moveTo((docWidth / 2), 698).lineTo((docWidth - 35), 698).stroke();
    doc.strokeColor('#ccc').moveTo((docWidth / 2), 713).lineTo((docWidth - 35), 713).stroke();
    doc.strokeColor('#ccc').moveTo((docWidth / 2), 728).lineTo((docWidth - 35), 728).stroke();
    doc.strokeColor('#ccc').moveTo((docWidth / 2), 743).lineTo((docWidth - 35), 743).stroke();
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 133), 758).lineTo((docWidth - 35), 758).stroke();

    doc.font('Body Font');
    doc.text(`${quote.freightReady}`, 125, 580);
    doc.strokeColor('#ccc').moveTo(123, 593).lineTo(((docWidth / 2) - 15), 593).stroke();
    doc.text(`${quote.pickupAppointment}`, 125, 595);
    doc.strokeColor('#ccc').moveTo(123, 608).lineTo(((docWidth / 2) - 15), 608).stroke();
    doc.text(`Yes`, 185, 625);
    if (quote.teamRequired) {
        doc.roundedRect(183, 625, 22, 15, 2).strokeColor('#242424').stroke();
    } else {
        doc.roundedRect(223, 625, 21, 15, 2).strokeColor('#242424').stroke();
    }
    doc.text(`or`, 208, 625);
    doc.text(`No`, 225, 625);
    doc.text(`${quote.broker.sb}`, 150, 640);
    doc.strokeColor('#ccc').moveTo(148, 653).lineTo(((docWidth / 2) - 15), 653).stroke();

    doc.font('Heading Font');
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

    doc.font('Body Font');
    if (quote.tailgate) {
        doc.roundedRect(((docWidth / 2) + 128), 276, 22, 13, 2).strokeColor('#242424').stroke();
    } else {
        doc.roundedRect(((docWidth / 2) + 163), 276, 20, 13, 2).strokeColor('#242424').stroke();
    }
    doc.text(`Yes`, ((docWidth / 2) + 130), 275);
    doc.text(`/`, ((docWidth / 2) + 155), 275);
    doc.text(`No`, ((docWidth / 2) + 165), 275);
    doc.text(`${quote.deliveryEta}`, ((docWidth / 2) + 85), 320);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 333).lineTo((docWidth - 35), 333).stroke();
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 348).lineTo((docWidth - 35), 348).stroke();
    doc.text(`${quote.deliveryAppointment}`, ((docWidth / 2) + 85), 355);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 368).lineTo((docWidth - 35), 368).stroke();
    
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 403).lineTo((docWidth - 35), 403).stroke();
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 418).lineTo((docWidth - 35), 418).stroke();
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 433).lineTo((docWidth - 35), 433).stroke();
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 448).lineTo((docWidth - 35), 448).stroke();
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 463).lineTo((docWidth - 35), 463).stroke();

    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 493).lineTo((docWidth - 35), 493).stroke();
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 508).lineTo((docWidth - 35), 508).stroke();
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 523).lineTo((docWidth - 35), 523).stroke();
    doc.strokeColor('#242424').moveTo(((docWidth / 2) + 83), 538).lineTo((docWidth - 35), 538).stroke();
    doc.strokeColor('#242424').moveTo(((docWidth / 2) + 83), 553).lineTo((docWidth - 35), 553).stroke();

    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 568).lineTo((docWidth - 35), 568).stroke();
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 583).lineTo((docWidth - 35), 583).stroke();
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 83), 598).lineTo((docWidth - 35), 598).stroke();
    doc.strokeColor('#242424').moveTo(((docWidth / 2) + 83), 613).lineTo((docWidth - 35), 613).stroke();
    doc.strokeColor('#242424').moveTo(((docWidth / 2) + 83), 628).lineTo((docWidth - 35), 628).stroke();
    doc.text(`${quote.broker.nb}`, ((docWidth / 2) + 115), 640);
    doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 113), 653).lineTo((docWidth - 35), 653).stroke();
    
    doc.text(`Yes`, ((docWidth / 2) + 130), 290);
    doc.text(`/`, ((docWidth / 2) + 155), 290);
    doc.text(`No`, ((docWidth / 2) + 165), 290);
    if (quote.tarp) {
        doc.roundedRect(((docWidth / 2) + 128), 290, 22, 13, 2).strokeColor('#242424').stroke();
    } else {
        doc.roundedRect(((docWidth / 2) + 163), 290, 20, 13, 2).strokeColor('#242424').stroke();
    }
    doc.end();
}

function buildCarrierRateSheet(dataCallback, endCallback, quote) {
    const doc = new PDFDocument({ size: 'Letter', layout: 'Landscape', margins: { left: 35, right: 35, bottom: 5 } });

    doc.registerFont('Heading Font', 'public/fonts/Dosis-SemiBold.ttf');
    doc.registerFont('Body Font', 'public/fonts/Dosis-Light.ttf');

    const docWidth = 792;
    const docHeight = 612;

    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    function createHeader() {
        doc.fontSize(12);
        doc.font('Heading Font').text(`From:`, 145, 30);
        doc.font('Body Font').text(`${quote.genericShipper.city}. ${quote.genericShipper.state}`, 200, 30);
        doc.strokeColor('#ccc').moveTo(198, 45).lineTo(((docWidth / 2) - 55), 45).stroke();
        doc.font('Heading Font').text(`To:`, (docWidth / 2), 30);
        doc.font('Body Font').text(`${quote.genericConsignee.city}. ${quote.genericConsignee.state}`, ((docWidth / 2) + 55), 30);
        doc.strokeColor('#ccc').moveTo(((docWidth / 2) + 53), 45).lineTo((docWidth - 145), 45).stroke();

        doc.fontSize(10);
        doc.strokeColor('#242424').moveTo(33, 50).lineTo((docWidth - 33), 50).stroke();
        doc.strokeColor('#242424').moveTo(33, 50).lineTo(33, 65).stroke();
        doc.font('Heading Font').text(`Name`, 55, 53);
        doc.strokeColor('#242424').moveTo(112, 50).lineTo(112, 65).stroke();
        doc.strokeColor('#242424').moveTo(114, 50).lineTo(114, 65).stroke();
        doc.font('Heading Font').text(`Carrier`, 150, 53);
        doc.strokeColor('#242424').moveTo(212, 50).lineTo(212, 65).stroke();
        doc.strokeColor('#242424').moveTo(214, 50).lineTo(214, 65).stroke();
        doc.font('Heading Font').text(`Date`, 219, 53);
        doc.strokeColor('#242424').moveTo(247, 50).lineTo(247, 65).stroke();
        doc.strokeColor('#242424').moveTo(249, 50).lineTo(249, 65).stroke();
        doc.font('Heading Font').text(`Notes`, 350, 53);
        doc.strokeColor('#242424').moveTo(512, 50).lineTo(512, 65).stroke();
        doc.strokeColor('#242424').moveTo(514, 50).lineTo(514, 65).stroke();
        doc.font('Heading Font').text(`TR / TRL`, 519, 53);
        doc.strokeColor('#242424').moveTo(572, 50).lineTo(572, 65).stroke();
        doc.strokeColor('#242424').moveTo(574, 50).lineTo(574, 65).stroke();
        doc.font('Heading Font').text(`Asked`, 579, 53);
        doc.strokeColor('#242424').moveTo(622, 50).lineTo(622, 65).stroke();
        doc.strokeColor('#242424').moveTo(624, 50).lineTo(624, 65).stroke();
        doc.font('Heading Font').text(`Quote`, 629, 53);
        doc.strokeColor('#242424').moveTo(672, 50).lineTo(672, 65).stroke();
        doc.strokeColor('#242424').moveTo(674, 50).lineTo(674, 65).stroke();
        doc.font('Heading Font').text(`Equip.`, 678, 53);
        doc.strokeColor('#242424').moveTo(712, 50).lineTo(712, 65).stroke();
        doc.strokeColor('#242424').moveTo(714, 50).lineTo(714, 65).stroke();
        doc.font('Heading Font').text(`Currency`, 717, 53);
        doc.strokeColor('#242424').moveTo((docWidth - 33), 50).lineTo((docWidth - 33), 65).stroke();
        doc.strokeColor('#242424').moveTo(33, 65).lineTo((docWidth - 33), 65).stroke();
    }

    function createRow(quote, rowHeight, i) {
        doc.fontSize(10);
        doc.font('Body Font').text(`${quote.carrierRates[i].dispatchName}`, 36, rowHeight, {width: 75});
        doc.font('Body Font').text(`${quote.carrierRates[i].carrierName}`, 116, rowHeight, {width: 99});
        doc.font('Body Font').text(`${quote.carrierRates[i].date[5]}${quote.carrierRates[i].date[6]}/${quote.carrierRates[i].date[8]}${quote.carrierRates[i].date[9]}`, 217, rowHeight);
        doc.font('Body Font').text(`${quote.carrierRates[i].carrierQuote}`, 255, rowHeight);
        if (quote.carrierRates[i].papsPars != '') {
            doc.font('Body Font').text(`${quote.carrierRates[i].papsPars} - Crossing @ ${quote.carrierRates[i].crossing}`, 255, (rowHeight + 30), {width: 150});
        }
        doc.font('Body Font').text(`P: ${quote.carrierRates[i].pickupDate}`, 425, rowHeight);
        doc.font('Body Font').text(`D: ${quote.carrierRates[i].deliveryDate}`, 425, (rowHeight + 15));
        // doc.font('Body Font').text(`${quote.carrierRates[0].carrierNotes}`, 250, rows[0], {width: 250});
        doc.font('Body Font').text(`${quote.carrierRates[i].carrierTruck}`, 520, rowHeight);
        doc.font('Body Font').text(`${quote.carrierRates[i].carrierTrailer}`, 520, (rowHeight + 15));
        doc.font('Body Font').text(`${quote.carrierRates[i].asked}`, 576, rowHeight);
        doc.font('Body Font').text(`${quote.carrierRates[i].carrierQuoteValue}`, 626, rowHeight);
        doc.font('Body Font').text(`${quote.carrierRates[i].carrierEquipment}`, 682, rowHeight);
        doc.font('Body Font').text(`${quote.carrierRates[i].carrierQuoteCurrency}`, 722, rowHeight);
        
        doc.strokeColor('#242424').moveTo(33, (rowHeight - 5)).lineTo(33, (rowHeight + 55)).stroke();

        doc.strokeColor('#242424').moveTo(112, (rowHeight - 5)).lineTo(112, (rowHeight + 55)).stroke();
        doc.strokeColor('#242424').moveTo(114, (rowHeight - 5)).lineTo(114, (rowHeight + 55)).stroke();

        doc.strokeColor('#242424').moveTo(212, (rowHeight - 5)).lineTo(212, (rowHeight + 55)).stroke();
        doc.strokeColor('#242424').moveTo(214, (rowHeight - 5)).lineTo(214, (rowHeight + 55)).stroke();

        doc.strokeColor('#242424').moveTo(247, (rowHeight - 5)).lineTo(247, (rowHeight + 55)).stroke();
        doc.strokeColor('#242424').moveTo(249, (rowHeight - 5)).lineTo(249, (rowHeight + 55)).stroke();

        doc.strokeColor('#242424').moveTo(512, (rowHeight - 5)).lineTo(512, (rowHeight + 55)).stroke();
        doc.strokeColor('#242424').moveTo(514, (rowHeight - 5)).lineTo(514, (rowHeight + 55)).stroke();

        doc.strokeColor('#242424').moveTo(572, (rowHeight - 5)).lineTo(572, (rowHeight + 55)).stroke();
        doc.strokeColor('#242424').moveTo(574, (rowHeight - 5)).lineTo(574, (rowHeight + 55)).stroke();

        doc.strokeColor('#242424').moveTo(622, (rowHeight - 5)).lineTo(622, (rowHeight + 55)).stroke();
        doc.strokeColor('#242424').moveTo(624, (rowHeight - 5)).lineTo(624, (rowHeight + 55)).stroke();

        doc.strokeColor('#242424').moveTo(672, (rowHeight - 5)).lineTo(672, (rowHeight + 55)).stroke();
        doc.strokeColor('#242424').moveTo(674, (rowHeight - 5)).lineTo(674, (rowHeight + 55)).stroke();
        
        doc.strokeColor('#242424').moveTo(712, (rowHeight - 5)).lineTo(712, (rowHeight + 55)).stroke();
        doc.strokeColor('#242424').moveTo(714, (rowHeight - 5)).lineTo(714, (rowHeight + 55)).stroke();

        doc.strokeColor('#242424').moveTo((docWidth - 33), (rowHeight - 5)).lineTo((docWidth - 33), (rowHeight + 55)).stroke();

        doc.strokeColor('#242424').moveTo(33, (rowHeight + 54)).lineTo((docWidth - 33), (rowHeight + 54)).stroke();
        doc.strokeColor('#242424').moveTo(33, (rowHeight + 56)).lineTo((docWidth - 33), (rowHeight + 56)).stroke();
    }

    let rows = [70, 130, 190, 250, 310, 370, 430, 490];
    let pages = 0;

    for (let i=0; i < quote.carrierRates.length; i++) {
        let rowHeight = rows[(pages * 8) - i];

        if (i % 8 === 0) {
            if (i != 0) {
                doc.addPage();
            }
            pages = pages + 1;
        }
        createHeader();
        createRow(quote, rowHeight, i);
        console.log(`${pages}, ${i}, ${rowHeight}`);
    }

    doc.end();
}

module.exports = { buildPurchaseOrder, buildInvoice, buildLogisticsCallSheet, buildCarrierRateSheet }