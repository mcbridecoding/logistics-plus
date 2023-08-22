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
        doc.text(`** Please pay the invice within ${invoice.terms} **`, 45, (docHeight - 145), { align: 'center' });
    }

    const subTotals = [];

    invoice.lineItems.forEach((line) => {
        subTotals.push(Number(line.lineTotal));
    });

    let currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CAD' });

    let subTotal = subTotals.reduce((a, b) => a + b, 0);
    const disc = subTotal * (Number(invoice.discount) / 100);
    subTotal = subTotal - disc;
    const gst = (Number(subTotal) * (Number(taxes.GST) / 100));
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
        doc.text(`GST @ ${taxes.GST}%:`, ((docWidth / 2) + 60), (docHeight - 80));
    } else {
        doc.text(`Discount (${invoice.discount} %):`, ((docWidth / 2) + 60), (docHeight - 95));
        doc.text(`PST @ ${taxes.PST}%:`, ((docWidth / 2) + 60), (docHeight - 80));
        doc.text(`GST @ ${taxes.GST}%:`, ((docWidth / 2) + 60), (docHeight - 65));
    }
    doc.text(`Total (${invoice.currency}):`, ((docWidth / 2) + 60), (docHeight - 40));

    doc.text(`${currency.format((subTotal + disc)).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 110), {align: 'right'});
    if (invoice.discount === null) {
        doc.text(`${currency.format(pst).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 95), {align: 'right'});
        doc.text(`${currency.format(gst).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 80), {align: 'right'});
    } else {
        doc.text(`- ${currency.format(disc).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 95), {align: 'right'});
        doc.text(`${currency.format(pst).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 80), {align: 'right'});
        doc.text(`${currency.format(gst).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 65), {align: 'right'});
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

function buildPurchaseOrders(dataCallback, endCallback, purchaseOrders) {
    const doc = new PDFDocument({ size: 'Letter', margins: { left: 45, right: 55, bottom: 5 } });
    const docWidth = 612;
    const docHeight = 792;

    doc.on('data', dataCallback);
    doc.on('end', endCallback);
    
    purchaseOrders.forEach((order) => {
        doc.addPage();
        doc.on('pageAdded', () => {
            doc.fontSize(20);
            doc.font('Helvetica-Bold');
            doc.text(`${order.soldTo.company}`, 50, 70); buildPurchaseOrder
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
        });        
    });
    
    doc.end();
}

module.exports = { buildPurchaseOrder, buildPurchaseOrders, buildInvoice }