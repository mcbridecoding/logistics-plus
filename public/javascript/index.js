window.addEventListener('DOMContentLoaded', (event) => {
    const myText = document.getElementById('notes');
    const wordCount = document.getElementById('wordCount');
    
    myText.addEventListener('keyup', function () {
        let characters = myText.value.split('');
        wordCount.innerText = characters.length;
    });
});

// ** -- Models -- **

const { text } = require("pdfkit");

function openDeleteModal(id) {
    document.getElementById(id).style.display = 'block';
    blurrBackground();
}

function closeDeleteModal(id) {
    document.getElementById(id).style.display = 'none';   
    cancelBlurrBackground(); 
}

function openModal(id) {
    document.getElementById(id).style.display = 'block';
    blurrBackground();
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
    cancelBlurrBackground(); 
}

// ** -- Blurr / Un-Blurr BackGround -- **

function blurrBackground() {
    document.getElementById('main').style.filter = 'blur(5px)';
    document.getElementById('nav-panel').style.filter = 'blur(5px)';
    document.getElementById('logout-button').style.display = 'none';
}

function cancelBlurrBackground() {
    document.getElementById('main').style.filter = 'blur(0px)';
    document.getElementById('nav-panel').style.filter = 'blur(0px)';
    document.getElementById('logout-button').style.display = 'block';
}

// ** -- Quote Menus -- **

function openShipmentHeader() {
    document.getElementById('quote-header').style.display = 'flex';
    document.getElementById('shipment-header-button').style.backgroundColor = '#2B2A4C';
    document.getElementById('shipment-header-button').style.color = '#ffff';
    document.getElementById('shipment-header-button').style.fontWeight = 'bold';
    
    closeShipmentDetails();
    closeShipmentChecklist();
    closeShippingCost();
    closeShipmentBOL();
}

function closeShipmentHeader() {
    document.getElementById('quote-header').style.display = 'none';
    document.getElementById('shipment-header-button').style.backgroundColor = '#EEE2DE';
    document.getElementById('shipment-header-button').style.color = '#242424';
    document.getElementById('shipment-header-button').style.fontWeight = '100';
}

function openShipmentDetails() {
    document.getElementById('shipment-details').style.display = 'flex';
    document.getElementById('shipment-detail-button').style.backgroundColor = '#2B2A4C';
    document.getElementById('shipment-detail-button').style.color = '#ffff';
    document.getElementById('shipment-detail-button').style.fontWeight = 'bold';
    
    closeShipmentHeader();
    closeShipmentChecklist();
    closeShippingCost();
    closeShipmentBOL();
}

function closeShipmentDetails() {
    document.getElementById('shipment-details').style.display = 'none';
    document.getElementById('shipment-detail-button').style.backgroundColor = '#EEE2DE';
    document.getElementById('shipment-detail-button').style.color = '#242424';
    document.getElementById('shipment-detail-button').style.fontWeight = '100';
}

function openShipmentChecklist() {
    document.getElementById('shipment-control-checklist').style.display = 'flex';
    document.getElementById('shipment-checklist-button').style.backgroundColor = '#2B2A4C';
    document.getElementById('shipment-checklist-button').style.color = '#ffff';
    document.getElementById('shipment-checklist-button').style.fontWeight = 'bold';
    
    closeShipmentHeader();
    closeShipmentDetails();
    closeShippingCost();
    closeShipmentBOL();
}

function closeShipmentChecklist() {
    document.getElementById('shipment-control-checklist').style.display = 'none';
    document.getElementById('shipment-checklist-button').style.backgroundColor = '#EEE2DE';
    document.getElementById('shipment-checklist-button').style.color = '#242424';
    document.getElementById('shipment-checklist-button').style.fontWeight = '100';
}

function openShippingCost() {
    document.getElementById('shipment-costing').style.display = 'flex';
    document.getElementById('shipment-costing-button').style.backgroundColor = '#2B2A4C';
    document.getElementById('shipment-costing-button').style.color = '#ffff';
    document.getElementById('shipment-costing-button').style.fontWeight = 'bold';
    
    closeShipmentHeader();
    closeShipmentDetails();
    closeShipmentChecklist();
    closeShipmentBOL();
}

function closeShippingCost() {
    document.getElementById('shipment-costing').style.display = 'none';
    document.getElementById('shipment-costing-button').style.backgroundColor = '#EEE2DE';
    document.getElementById('shipment-costing-button').style.color = '#242424';
    document.getElementById('shipment-costing-button').style.fontWeight = '100';
}

function openShipmentBOL() {
    document.getElementById('shipment-bol').style.display = 'flex';
    document.getElementById('shipment-bol-button').style.backgroundColor = '#2B2A4C';
    document.getElementById('shipment-bol-button').style.color = '#ffff';
    document.getElementById('shipment-bol-button').style.fontWeight = 'bold';

    closeShipmentHeader();
    closeShipmentDetails();
    closeShipmentChecklist();    
    closeShippingCost();
}

function closeShipmentBOL() {
    document.getElementById('shipment-bol').style.display = 'none';
    document.getElementById('shipment-bol-button').style.backgroundColor = '#EEE2DE';
    document.getElementById('shipment-bol-button').style.color = '#242424';
    document.getElementById('shipment-bol-button').style.fontWeight = '100';
}

function calculateCUFT(row) {
    let length = document.getElementById(`l${row}`).value;    
    let width = document.getElementById(`w${row}`).value;    
    let height = document.getElementById(`h${row}`).value;    
    let count = document.getElementById(`c${row}`).value;  
    
    let cuft = length * width * height * count;

    document.getElementById(`cf${row}`).value = cuft;
    calculateTotalCUFT();
}

function showThirdpartyInput(value) {
    if (value === 'TP') {
        document.getElementById(`thirdPartyInformationPanel`).style.display = 'block';
    } else {
        document.getElementById(`thirdPartyInformationPanel`).style.display = 'none';
    }
}

function showAddClientModal(value, modal) {
    if (value === 'new') {
        openModal(`${modal}-modal`);
        showButton(modal);
    } else {
        closeModal(`${modal}-modal`);
        hideButton(modal)
    }    
}

function showButton(modal) {
    document.getElementById(`${modal}-button`).style.display = 'flex';
}

function hideButton(modal) {
    document.getElementById(`${modal}-button`).style.display = 'none';
}

function calculateTotalCUFT() {
    let sumCUFT = 0;

    let row1 = Number(document.getElementById('cf1').value);
    let row2 = Number(document.getElementById('cf2').value);
    let row3 = Number(document.getElementById('cf3').value);
    let row4 = Number(document.getElementById('cf4').value);
    let row5 = Number(document.getElementById('cf5').value);
    let row6 = Number(document.getElementById('cf6').value);
    let row7 = Number(document.getElementById('cf7').value);
    let row8 = Number(document.getElementById('cf8').value);
    let row9 = Number(document.getElementById('cf9').value);
    let row10 = Number(document.getElementById('cf10').value);
    
    sumCUFT = row1 + row2 + row3 + row4 + row5 + row6 + row7 + row8 + row9 + row10;
    
    let cuftTotal = Number(sumCUFT) / 1728

    document.getElementById('totalCUFT').value = Number(cuftTotal).toFixed(2); 
}

function unlockElement(id) {
    if (id === 'defaultPurchasing') {
        document.getElementById(`${id}BillTo`).disabled = false;
        document.getElementById(`${id}Vendor`).disabled = false;
        document.getElementById(`${id}ShipTo`).disabled = false;
    }
    if (id === 'defaultInvoicing') {
        document.getElementById(`${id}BillTo`).disabled = false;
        document.getElementById(`${id}ShipTo`).disabled = false; 
    }
    document.getElementById(`${id}Footer`).style.display = 'flex';  
}

function lockElement(id) {
    if (id === 'defaultPurchasing') {
        document.getElementById(`${id}BillTo`).disabled = true;
        document.getElementById(`${id}Vendor`).disabled = true;
        document.getElementById(`${id}ShipTo`).disabled = true;
    }
    if (id === 'defaultInvoicing') {
        document.getElementById(`${id}BillTo`).disabled = true;
        document.getElementById(`${id}ShipTo`).disabled = true;
    }
    document.getElementById(`${id}Footer`).style.display = 'none';
}

function addSku(id) {
    if (id === 'new') {
        document.getElementById('sku').style.display = 'flex';
        document.getElementById('reorder').style.display = 'flex';
    } else {
        document.getElementById('sku').style.display = 'none';           
        document.getElementById('reorder').style.display = 'none';           
    }
}

function unlockItems() {
    document.getElementById('itemId').readOnly = false;
    document.getElementById('itemDescription').readOnly = false;
    document.getElementById('sellPrice').readOnly = false;
    document.getElementById('uom').disabled = false;
    document.getElementById('reOrderPoint').readOnly = false;
    document.getElementById('itemNotes').readOnly = false;
    document.getElementById('items-footer').style.display = 'flex';
}

function lockItems() {
    document.getElementById('itemId').readOnly = true;
    document.getElementById('itemDescription').readOnly = true;
    document.getElementById('sellPrice').readOnly = true;
    document.getElementById('uom').disabled = true;
    document.getElementById('reOrderPoint').readOnly = true;
    document.getElementById('itemNotes').readOnly = true; 
    document.getElementById('items-footer').style.display = 'none';
}

function openAccessorial(id) {
    if (id === 'accessorial') {
        document.getElementById('accessorial').style.display = 'block';
        document.getElementById('product').style.display = 'none';
    } else {
        document.getElementById('accessorial').style.display = 'none';
        document.getElementById('product').style.display = 'block'; 
    }
}
