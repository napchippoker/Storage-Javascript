// Constants
const BANK_CODE = 'Liên Hệ Telegram @allintvclub';
const ACCOUNT_NUMBER = 'Liên Hệ Telegram @allintvclub';
const ACCOUNT_NAME = 'Liên Hệ Telegram @allintvclub';
const BANK_NAME = 'Liên Hệ Telegram @allintvclub';
const SUBMIT_COOLDOWN = 5000;

// Amount buttons configuration
const amounts = [50000, 100000, 200000, 500000, 1000000, 2000000];
const buttonIds = ['GROUP2', 'GROUP3', 'GROUP4', 'GROUP12', 'GROUP10', 'GROUP9'];

// Global variables
let isSubmitting = false;
let lastSuccessfulSubmitTime = 0;

// Utility functions
function validateAmount(amount) {
    return amount >= 20000;
}

function showCopiedHint(target) {
    const hint = document.createElement('div');
    hint.textContent = 'Copied!';
    hint.style.position = 'absolute';
    hint.style.backgroundColor = 'black';
    hint.style.color = 'white';
    hint.style.padding = '5px 10px';
    hint.style.borderRadius = '4px';
    hint.style.fontSize = '12px';
    hint.style.zIndex = '1000';

    const rect = target.getBoundingClientRect();
    hint.style.top = `${rect.bottom + window.scrollY + 5}px`;
    hint.style.left = `${rect.left + window.scrollX}px`;

    document.body.appendChild(hint);

    setTimeout(() => {
        document.body.removeChild(hint);
    }, 500);
}

function generateQR(amount, identifier) {
    const encodedAccountName = encodeURIComponent(ACCOUNT_NAME);
    const encodedTransferContent = encodeURIComponent(identifier);
    const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const qrUrl = `https://w.ladicdn.com/604f0bd5cc7c87002c31ddf1/allintvclub-20241220091712-rpjhx.png`;
    
    document.getElementById('qrCodeContainer').querySelector('.ladi-image-background').style = `background-image: url("${qrUrl}")!important`;
    document.getElementById('GROUP107').style = 'display:block!important';
    document.getElementById('GROUP118').style = 'display:none!important';
    document.getElementById('qrCodeContainer').style = 'display:block!important';
    document.getElementById('GROUP105').style = 'display:block!important';
    document.getElementById('GROUP39').style = 'display:none!important';
    document.getElementById('SECTION1').style = 'height: 750px'
    document.getElementById('bankName').querySelector('h3').textContent = BANK_NAME;
    document.getElementById('accountNumber').querySelector('h3').textContent = ACCOUNT_NUMBER;
    document.getElementById('accountName').querySelector('h3').textContent = ACCOUNT_NAME;
    document.getElementById('paymentAmount').querySelector('h3').innerHTML = `${money}<div data-action="true" id="GROUP100" class="ladi-element" style="display:block !important"><div class="ladi-group"><div id="BOX44" class="ladi-element"><div class="ladi-box ladi-transition ladi-lazyload"></div></div><div id="SHAPE28" class="ladi-element"><div class="ladi-shape"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 24 24" class="" fill="rgba(255, 255, 255, 1)"> <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"></path> </svg></div></div></div></div>`;
    
    document.getElementById('transferContent').querySelector('h3').innerHTML = `${identifier}<div id="GROUP101" class="ladi-element" style="display:block !important"><div class="ladi-group"><div id="BOX45" class="ladi-element"><div class="ladi-box ladi-transition"></div></div><div id="SHAPE29" class="ladi-element"><div class="ladi-shape"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 24 24" class="" fill="rgba(255, 255, 255, 1)"> <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"></path></svg></div></div></div></div>`;

    setupClipboard();
}

function setupClipboard() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.8/clipboard.min.js';
    script.onload = function() {
        new ClipboardJS('#GROUP101', {
            text: function(trigger) {
                return document.getElementById('gameId').value;
            }
        }).on('success', function(e) {
            showCopiedHint(e.trigger);
            e.clearSelection();
        });
        new ClipboardJS('#GROUP100', {
            text: function(trigger) {
                return document.getElementById('amount').value;
            }
        }).on('success', function(e) {
            showCopiedHint(e.trigger);
            e.clearSelection();
        });
    };
    document.head.appendChild(script);
}

function highlightButton(selectedButton) {
    buttonIds.forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            button.classList.remove('selected');
        }
    });
    selectedButton.classList.add('selected');
}

function initializeUI() {
    const form = document.getElementById('paymentForm');
    const submitBtn = document.getElementById('submit-btn');
    const amountInput = document.getElementById('amount');

    submitBtn.addEventListener('click', handleSubmit);

    buttonIds.forEach((id, index) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', function() {
                amountInput.value = amounts[index].toLocaleString('vi-VN');
                highlightButton(this);
            });
        }
    });

    amountInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value) {
            value = parseInt(value).toLocaleString('vi-VN');
            this.value = value;
        }
    });

    const style = document.createElement('style');
    style.textContent = `
        .amount-button.selected > .ladi-box.ladi-transition {
            background-color: #0066FF !important;
            color: white;
        }
    `;
    document.head.appendChild(style);
}

function handleSubmit(event) {
    event.preventDefault();

    const now = Date.now();
    if (isSubmitting || (now - lastSuccessfulSubmitTime < SUBMIT_COOLDOWN)) {
        return;
    }

    isSubmitting = true;

    const submitBtn = document.getElementById('submit-btn');
    const originalButtonText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang xử lý...';

    const idGame = document.getElementById('gameId').value;
    const amount = parseFloat(document.getElementById('amount').value.replace(/\./g, ''));
    const messageElement = document.getElementById('message');
    const formElement = document.getElementById('paymentForm');

    try {
        if (!idGame) {
            messageElement.innerHTML = `<h3 class="ladi-headline" style='color:red'>Vui lòng nhập ID game hợp lệ.<br></h3>`;
            return;
        }

        if (!validateAmount(amount)) {
            messageElement.innerHTML = `<h3 class="ladi-headline" style='color:red'>Số tiền phải từ 20.000 VND trở lên.<br></h3>`;
            return;
        }

        formElement.style.display = 'none';
        messageElement.innerHTML = '<h3 class="ladi-headline">Vui lòng quét mã QR để thanh toán.</h3>';
        generateQR(amount, idGame);
        
        lastSuccessfulSubmitTime = Date.now();
    } catch (error) {
        console.error('Error in handleSubmit:', error);
        messageElement.innerHTML = '<h3 class="ladi-headline">Có lỗi xảy ra. Vui lòng thử lại sau.</h3>';
    } finally {
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.textContent = originalButtonText;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    verifyHtmlIds();
});

function verifyHtmlIds() {
    const requiredIds = [
        'paymentForm', 'submit-btn', 'message', 'gameId', 'amount',
        'qrCodeContainer', 'GROUP105', 'GROUP39', 'bankName',
        'accountNumber', 'accountName', 'paymentAmount', 'transferContent'
    ];

    const missingIds = requiredIds.filter(id => !document.getElementById(id));
    if (missingIds.length > 0) {
        console.error('Missing HTML elements with IDs:', missingIds);
    } else {
        console.log('All required HTML elements are present in the document.');
    }
}

window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
});

console.log('Payment script loaded and initialized');
