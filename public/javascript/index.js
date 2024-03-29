const checkBoxAll = document.querySelector('#checkAll');
const checkboxOptions = document.querySelectorAll('.checkbox-option');
const deleteButton = document.querySelector('#delete-button');

if (checkBoxAll) {
    checkBoxAll.addEventListener('change', () => {
        Array.from(checkboxOptions).map((checkbox) => {
            checkbox.checked = checkBoxAll.checked;
        });
        toggleDeleteButton();  
    });
}

if (checkboxOptions) {
    Array.from(checkboxOptions).map((checkbox) => {
        checkbox.addEventListener('change', () => {
           toggleDeleteButton();
        });
    });
}

function toggleDeleteButton() {
    let options = [];
    for (let i=0; i < checkboxOptions.length; i++) {
        options.push(checkboxOptions[i].checked);
    }

    if (options.includes(true)) {
        deleteButton.style.display = 'flex';
    } else {
        deleteButton.style.display = 'none';
    }
}

const myText = document.querySelector('#notes');
const wordCount = document.querySelector('#wordCount');

if (myText) {
    myText.addEventListener('keyup', () => {
        let characters = myText.value.split('');
        wordCount.innerText = characters.length;
    });
}

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
    document.getElementById('main').style.pointerEvents = 'none';
    document.getElementById('nav-panel').style.filter = 'blur(5px)';
    document.getElementById('nav-panel').style.pointerEvents = 'none';

    document.getElementById('logout-button').style.display = 'none';
}

function cancelBlurrBackground() {
    document.getElementById('main').style.filter = 'blur(0px)';
    document.getElementById('main').style.pointerEvents = 'auto';
    document.getElementById('nav-panel').style.filter = 'blur(0px)';
    document.getElementById('nav-panel').style.pointerEvents = 'auto';

    document.getElementById('logout-button').style.display = 'block';
}

// ** -- Quote Menus -- **

function openShipmentHeader() {
    document.getElementById('quote-header').style.display = 'flex';
    document.getElementById('shipment-header-button').style.backgroundColor = '#2B2A4C';
    document.getElementById('shipment-header-button').style.color = '#EA906C';
    document.getElementById('shipment-header-button').style.fontWeight = 'bold';
    
    closeShipmentDetails();
    closeShipmentChecklist();
    closeShippingCost();
    closeForms();
    closeCarrierRates();
}

function closeShipmentHeader() {
    document.getElementById('quote-header').style.display = 'none';
    document.getElementById('shipment-header-button').style.backgroundColor = '#242424';
    document.getElementById('shipment-header-button').style.color = '#ffff';
    document.getElementById('shipment-header-button').style.fontWeight = '100';
}

function openShipmentDetails() {
    document.getElementById('shipment-details').style.display = 'flex';
    document.getElementById('shipment-detail-button').style.backgroundColor = '#2B2A4C';
    document.getElementById('shipment-detail-button').style.color = '#EA906C';
    document.getElementById('shipment-detail-button').style.fontWeight = 'bold';
    
    closeShipmentHeader();
    closeShipmentChecklist();
    closeShippingCost();
    closeForms();
    closeCarrierRates();
}

function closeShipmentDetails() {
    document.getElementById('shipment-details').style.display = 'none';
    document.getElementById('shipment-detail-button').style.backgroundColor = '#242424';
    document.getElementById('shipment-detail-button').style.color = '#ffff';
    document.getElementById('shipment-detail-button').style.fontWeight = '100';
}

function openShipmentChecklist() {
    document.getElementById('shipment-control-checklist').style.display = 'flex';
    document.getElementById('shipment-checklist-button').style.backgroundColor = '#2B2A4C';
    document.getElementById('shipment-checklist-button').style.color = '#EA906C';
    document.getElementById('shipment-checklist-button').style.fontWeight = 'bold';
    
    closeShipmentHeader();
    closeShipmentDetails();
    closeShippingCost();
    closeForms();
    closeCarrierRates();
}

function closeShipmentChecklist() {
    document.getElementById('shipment-control-checklist').style.display = 'none';
    document.getElementById('shipment-checklist-button').style.backgroundColor = '#242424';
    document.getElementById('shipment-checklist-button').style.color = '#ffff';
    document.getElementById('shipment-checklist-button').style.fontWeight = '100';
}

function openShippingCost() {
    document.getElementById('shipment-costing').style.display = 'flex';
    document.getElementById('shipment-costing-button').style.backgroundColor = '#2B2A4C';
    document.getElementById('shipment-costing-button').style.color = '#EA906C';
    document.getElementById('shipment-costing-button').style.fontWeight = 'bold';
    
    closeShipmentHeader();
    closeShipmentDetails();
    closeShipmentChecklist();
    closeForms();
    closeCarrierRates();
}

function closeShippingCost() {
    document.getElementById('shipment-costing').style.display = 'none';
    document.getElementById('shipment-costing-button').style.backgroundColor = '#242424';
    document.getElementById('shipment-costing-button').style.color = '#ffff';
    document.getElementById('shipment-costing-button').style.fontWeight = '100';
}

function openForms() {
    document.getElementById('forms').style.display = 'flex';
    document.getElementById('forms-button').style.backgroundColor = '#2B2A4C';
    document.getElementById('forms-button').style.color = '#EA906C';
    document.getElementById('forms-button').style.fontWeight = 'bold';

    closeShipmentHeader();
    closeShipmentDetails();
    closeShipmentChecklist();    
    closeShippingCost();
    closeCarrierRates();
}

function closeForms() {
    document.getElementById('forms').style.display = 'none';
    document.getElementById('forms-button').style.backgroundColor = '#242424';
    document.getElementById('forms-button').style.color = '#ffff';
    document.getElementById('forms-button').style.fontWeight = '100';
}

function openCarrierRates() {
    document.getElementById('carrier-rates').style.display = 'flex';
    document.getElementById('carrier-rates-button').style.backgroundColor = '#2B2A4C';
    document.getElementById('carrier-rates-button').style.color = '#EA906C';
    document.getElementById('carrier-rates-button').style.fontWeight = 'bold';

    closeShipmentHeader();
    closeShipmentDetails();
    closeShipmentChecklist();    
    closeShippingCost();
    closeForms();
}

function closeCarrierRates() {
    document.getElementById('carrier-rates').style.display = 'none';
    document.getElementById('carrier-rates-button').style.backgroundColor = '#242424';
    document.getElementById('carrier-rates-button').style.color = '#ffff';
    document.getElementById('carrier-rates-button').style.fontWeight = '100';
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
    document.getElementById(`defaultPurchasingBillTo`).disabled = false;
    document.getElementById(`defaultPurchasingVendor`).disabled = false;
    document.getElementById(`defaultPurchasingShipTo`).disabled = false;

    document.getElementById(`defaultInvoicingBillTo`).disabled = false;
    document.getElementById(`defaultInvoicingShipTo`).disabled = false; 

    document.getElementById(`defaultOwnerCompany`).readOnly = false;
    document.getElementById(`defaultOwnerAttention`).readOnly = false;
    document.getElementById(`defaultOwnerAddressOne`).readOnly = false;
    document.getElementById(`defaultOwnerAddressTwo`).readOnly = false;
    document.getElementById(`defaultOwnerCity`).readOnly = false;
    document.getElementById(`defaultOwnerState`).readOnly = false;
    document.getElementById(`defaultOwnerPostal`).readOnly = false;
    document.getElementById(`defaultOwnerCountry`).readOnly = false;
    document.getElementById(`defaultOwnerPhone`).readOnly = false;
    document.getElementById(`defaultOwnerFax`).readOnly = false;
    document.getElementById(`defaultOwnerEmail`).readOnly = false;

    document.getElementById('edit-button').style.display = 'none';
    document.getElementById(`defaultFooter`).style.display = 'flex';  
}

function lockElement(id) {
    document.getElementById(`defaultPurchasingBillTo`).disabled = true;
    document.getElementById(`defaultPurchasingVendor`).disabled = true;
    document.getElementById(`defaultPurchasingShipTo`).disabled = true;

    document.getElementById(`defaultInvoicingBillTo`).disabled = true;
    document.getElementById(`defaultInvoicingShipTo`).disabled = true;
    
    document.getElementById(`defaultOwnerCompany`).readOnly = true;
    document.getElementById(`defaultOwnerAttention`).readOnly = true;
    document.getElementById(`defaultOwnerAddressOne`).readOnly = true;
    document.getElementById(`defaultOwnerAddressTwo`).readOnly = true;
    document.getElementById(`defaultOwnerCity`).readOnly = true;
    document.getElementById(`defaultOwnerState`).readOnly = true;
    document.getElementById(`defaultOwnerPostal`).readOnly = true;
    document.getElementById(`defaultOwnerCountry`).readOnly = true;
    document.getElementById(`defaultOwnerPhone`).readOnly = true;
    document.getElementById(`defaultOwnerFax`).readOnly = true;
    document.getElementById(`defaultOwnerEmail`).readOnly = true;

    document.getElementById(`defaultFooter`).style.display = 'none';
    document.getElementById('edit-button').style.display = 'flex';
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

function accountSubMenu(id) {
    let value = document.getElementById(`${id}-button`);
    let menu = document.getElementById(`${id}-menu`);
    
    if (value.dataset.value === 'closed') {
        menu.style.display = 'flex';
        document.getElementById(`${id}-arrow`).style.transform = 'rotate(-90deg)';
        value.dataset.value = 'open';
    } else {
        document.getElementById(`${id}-menu`).style.display = 'none';
        document.getElementById(`${id}-arrow`).style.transform = 'rotate(0deg)';
        value.dataset.value = 'closed';
    }
}

function toggleSubMenu(id) {
    let value = document.getElementById(`${id}-button`);
    let panel = document.getElementById(`${id}-panel`);
    let arrow = document.getElementById(`${id}-arrow`); 
    
    if (value.dataset.value === 'closed') {
        panel.style.display = 'flex';
        arrow.style.transform = 'rotate(-90deg)';
        value.dataset.value = 'open';
    } else {
        panel.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
        value.dataset.value = 'closed';
    }
}

function openFolder(openId, closeId) {
    let openFolder = document.getElementById(openId);
    openFolder.style.display = 'flex';
    closeFolder(closeId);
}

function closeFolder(closeId) {
    let folder = document.getElementById(closeId);
    folder.style.display = 'none';
}

function openOrdersSubMenu() {
    let button = document.getElementById('order-open-button');
    let panel = document.getElementById('order-search-column');

    let searchFields = document.getElementById('order-search-frame');

    if (button.dataset.value === 'open') {
        button.style.transform = 'rotate(180deg)';
        button.dataset.value = 'closed';

        panel.style.minWidth = '450px';
        panel.style.maxWidth = '450px';

        searchFields.style.display = 'flex';
    } else {
        button.style.transform = 'rotate(0deg)';
        button.dataset.value = 'open';
        
        panel.style.minWidth = '100px';
        panel.style.maxWidth = '100px';

        searchFields.style.display = 'none';
    }

}
