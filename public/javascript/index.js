// ** -- Models -- **

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
}

function cancelBlurrBackground() {
    document.getElementById('main').style.filter = 'blur(0px)';
    document.getElementById('nav-panel').style.filter = 'blur(0px)';
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
    closeShippingCost()
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
    closeShippingCost()
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
}

function closeShippingCost() {
    document.getElementById('shipment-costing').style.display = 'none';
    document.getElementById('shipment-costing-button').style.backgroundColor = '#EEE2DE';
    document.getElementById('shipment-costing-button').style.color = '#242424';
    document.getElementById('shipment-costing-button').style.fontWeight = '100';
}