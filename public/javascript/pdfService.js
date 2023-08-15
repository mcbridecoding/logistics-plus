const PDFDocument = require('pdfkit-table')

function buildPurchaseOrder(dataCallback, endCallback, po, soldTo, vendor, shipTo, taxes) {
    const doc = new PDFDocument({ size: 'Letter', margins: { left: 45, right: 55, bottom: 5 } });

    const docWidth = 612;
    const docHeight = 792;

    doc.on('data', dataCallback);
    doc.on('end', endCallback);
    
    doc.fontSize(20);
    doc.font('Helvetica-Bold');
    doc.text(`${soldTo.company}`, 50, 70); 
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
    
    doc.text(`${po.purchaseOrderNumber}`, 480, 75, { align: 'right' });
    doc.text(`${po.date}`, 480, 90, { align: 'right' });
    doc.text(`${po.currency}`, 400, 120, { align: 'right' });
    doc.text(`${po.shipMethod}`, 400, 135, { align: 'right' });

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
        datas: po.lineItems
    }

    doc.table(table, { width: (docWidth - 50), x: 50, y: 273 });

    const subTotals = [];

    po.lineItems.forEach((line) => {
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
    doc.text(`${po.notes}`, 48, (docHeight - 80), {align: 'left', width: (docWidth / 2)});

    doc.fontSize(9);
    doc.font(`Helvetica`);
    doc.text(`Sub Total:`, ((docWidth / 2) + 60), (docHeight - 95));
    doc.text(`PST @ ${taxes.PST}%:`, ((docWidth / 2) + 60), (docHeight - 80));
    doc.text(`GST @ ${taxes.GST}%:`, ((docWidth / 2) + 60), (docHeight - 65));
    doc.text(`Total:`, ((docWidth / 2) + 60), (docHeight - 40));

    doc.text(`${currency.format(subTotal).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 95), {align: 'right'});
    doc.text(`${currency.format(pst).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 80), {align: 'right'});
    doc.text(`${currency.format(gst).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 65), {align: 'right'});
    doc.text(`${currency.format(total).slice(2)}`, ((docWidth / 2) + 180), (docHeight - 40), {align: 'right'});

    doc.end();
}

module.exports = { buildPurchaseOrder }