// Constants
const SHEET_ID = '1Zebh-8FerNoGurfyqQP-pcSFFT_CXAcnh1I-GFHpv_c';
const SHEET_TITLE = 'Sheet1';
const SHEET_RANGE = 'A:L';
const BANK_CODE = 'MB';
const ACCOUNT_NUMBER = '0389124412';
const ACCOUNT_NAME = 'LE THI BICH HANH';
const BANK_NAME = 'MB BANK';
const SUBMIT_COOLDOWN = 5000;
const API_URL = 'https://script.google.com/macros/s/AKfycbxnRTPFG7ngo9CXescAdBnhFDlVrjJvtt6ukd9fkb-t3W_wnHHyJo6fMT__1ggU2v-uTA/exec';

// Amount buttons configuration
const amounts = [50000, 100000, 200000, 500000, 1000000, 2000000];
const buttonIds = ['GROUP2', 'GROUP3', 'GROUP4', 'GROUP12', 'GROUP10', 'GROUP9'];

// Global variables
let isSubmitting = false;
let lastSuccessfulSubmitTime = 0;
let currentCheckInterval = null;

// Utility functions
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getUserToken() {
    let token = localStorage.getItem('userToken');
    if (!token) {
        token = generateUUID();
        localStorage.setItem('userToken', token);
    }
    // console.log('User token:', token);
    return token;
}

function validateEmail(email) {
    const validDomains = ['@gmail.com', '@icloud.com'];
    return validDomains.some(domain => email.toLowerCase().endsWith(domain));
}

function validateAmount(amount) {
    return amount >= 20000;
}

async function sendDataToSheet(email, amount) {
    const userToken = getUserToken();
    // console.log('Sending new data to sheet:', { email, amount, userToken });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, amount, userToken, action: 'add' }),
        });
        
        // console.log('Response received for new data');
        const userStatus = await getUserStatus();
        
        if (userStatus.hasPaid) {
            // console.log('New payment recorded successfully');
            return { success: true, gameId: userStatus.gameId };
        } else {
            // console.log('Payment recorded, but user status not updated');
            return { success: true, gameId: null };
        }
    } catch (error) {
        console.error('Error sending new data:', error);
        return { success: false, gameId: null };
    }
}

async function sendExistingDataToSheet(email, amount, userStatus) {
    const userToken = getUserToken();
    // console.log('Updating existing data in sheet:', { email, amount, userToken, gameId: userStatus.gameId });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'update',
                email: email,
                amount: amount,
                userToken: userToken,
                gameId: userStatus.gameId,
                setPending: true
            }),
        });

        // console.log('Response received for updating existing data');
        
        // Vì mode là 'no-cors', chúng ta không thể đọc response trực tiếp
        // Thay vào đó, hãy kiểm tra lại trạng thái người dùng sau khi gửi
        await new Promise(resolve => setTimeout(resolve, 2000)); // Đợi 2 giây
        const updatedStatus = await getUserStatus();
        // console.log('Updated user status after sending data:', updatedStatus);

        if (updatedStatus.amount === amount && updatedStatus.email === email) {
            // console.log('Update successful: Data in sheet matches sent data');
            return { success: true };
        } else {
            // console.log('Update may have failed: Data mismatch or not updated');
            return { success: false };
        }
    } catch (error) {
        console.error('Error updating existing data:', error);
        return { success: false };
    }
}

async function getUserStatus() {
    const userToken = getUserToken();
    const FULL_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${SHEET_TITLE}&range=${SHEET_RANGE}`;

    try {
        const response = await fetch(FULL_URL);
        const text = await response.text();
        const data = JSON.parse(text.substr(47).slice(0, -2));
        
        for (let row of data.table.rows) {
            if (row.c[3] && row.c[3].v === userToken) {
                const isDone = row.c[10] && row.c[10].v === 'Done' && row.c[11] && row.c[11].v === 'Done';
                const gameId = row.c[9] ? row.c[9].v : null;
                const status = { 
                    hasPaid: true, 
                    isDone: isDone, 
                    gameId: gameId,
                    email: row.c[1] ? row.c[1].v : null,
                    amount: row.c[2] ? row.c[2].v : null,
                    statusK: row.c[10] ? row.c[10].v : null,
                    statusL: row.c[11] ? row.c[11].v : null
                };
                // console.log('User status found:', status);
                return status;
            }
        }
        // console.log('User status not found');
        return { hasPaid: false };
    } catch (error) {
        console.error('Error checking user status:', error);
        return { hasPaid: false };
    }
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
    // console.log('Generating QR for:', { amount, identifier });
    const encodedAccountName = encodeURIComponent(ACCOUNT_NAME);
    const encodedTransferContent = encodeURIComponent(identifier);
    const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const qrUrl = `https://img.vietqr.io/image/${BANK_CODE}-${ACCOUNT_NUMBER}-compact.png?amount=${amount}&addInfo=${encodedTransferContent}&accountName=${encodedAccountName}`;
    
    document.getElementById('qrCodeContainer').querySelector('.ladi-image-background').style = `background-image: url("${qrUrl}")!important`;
    document.getElementById('GROUP121').style = 'display:block!important';
    document.getElementById('GROUP118').style = 'display:none!important';
    document.getElementById('qrCodeContainer').style = 'display:block!important';
    document.getElementById('GROUP105').style = 'display:block!important';
    document.getElementById('GROUP39').style = 'display:none!important';
    document.getElementById('SECTION1').style = 'height: 650px'
    document.getElementById('bankName').querySelector('h3').textContent = BANK_NAME;
    document.getElementById('accountNumber').querySelector('h3').textContent = ACCOUNT_NUMBER;
    document.getElementById('accountName').querySelector('h3').textContent = ACCOUNT_NAME;
    document.getElementById('paymentAmount').querySelector('h3').innerHTML = `${money}<div data-action="true" id="GROUP100" class="ladi-element" style="display:block !important"><div class="ladi-group"><div id="BOX44" class="ladi-element"><div class="ladi-box ladi-transition ladi-lazyload"></div></div><div id="SHAPE28" class="ladi-element"><div class="ladi-shape"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 24 24" class="" fill="rgba(255, 255, 255, 1)"> <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"></path> </svg></div></div></div></div>`;
    
    document.getElementById('transferContent').querySelector('h3').innerHTML = `${identifier}<div id="GROUP101" class="ladi-element" style="display:block !important"><div class="ladi-group"><div id="BOX45" class="ladi-element"><div class="ladi-box ladi-transition"></div></div><div id="SHAPE29" class="ladi-element"><div class="ladi-shape"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 24 24" class="" fill="rgba(255, 255, 255, 1)"> <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"></path></svg></div></div></div></div>`;

    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.8/clipboard.min.js';
    script.onload = function() {
        new ClipboardJS('#GROUP101', {
            text: function(trigger) {
                return identifier;
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
    // console.log('Initializing UI');
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

async function checkUserStatusAndUpdateUI() {
    // console.log('Checking user status and updating UI');
    const messageElement = document.getElementById('message');
    const userStatus = await getUserStatus();

    if (userStatus.hasPaid && userStatus.isDone && userStatus.gameId) {
        messageElement.innerHTML = '';
        // console.log('Previous payment info:', userStatus);
    } else {
        messageElement.innerHTML = '';
    }
}


async function handleSubmit(event) {
    event.preventDefault();
    // console.log('Handle submit triggered');

    const now = Date.now();
    if (isSubmitting || (now - lastSuccessfulSubmitTime < SUBMIT_COOLDOWN)) {
        // console.log('Đang xử lý hoặc quá sớm để gửi lại. Vui lòng đợi.');
        return;
    }

    isSubmitting = true;

    const submitBtn = document.getElementById('submit-btn');
    const originalButtonText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang xử lý...';

    const email = document.getElementById('email').value;
    const amount = parseFloat(document.getElementById('amount').value.replace(/\./g, ''));
    const messageElement = document.getElementById('message');
    const formElement = document.getElementById('paymentForm');

    // console.log('Form submitted:', { email, amount });

    try {
        if (!validateEmail(email)) {
            messageElement.innerHTML = `<h3 class="ladi-headline" style='color:red'>Vui lòng nhập email @gmail.com hoặc @icloud.com hợp lệ.<br></h3>`;
            return;
        }

        if (!validateAmount(amount)) {
            messageElement.innerHTML = `<h3 class="ladi-headline" style='color:red'>Số tiền phải từ 20.000 VND trở lên.<br></h3>`;
            return;
        }

        const userStatus = await getUserStatus();
        // console.log('Current user status:', userStatus);

        let result;
        if (userStatus.hasPaid) {
            // console.log('Updating existing payment');
            result = await sendExistingDataToSheet(email, amount, userStatus);
        } else {
            // console.log('Creating new payment');
            result = await sendDataToSheet(email, amount);
        }

        if (result.success) {
            // Ẩn form
            formElement.style.display = 'none';

            // Hiển thị thông báo và QR code
            messageElement.innerHTML = '<h3 class="ladi-headline">Vui lòng quét mã QR để thanh toán.</h3>';
            generateQR(amount, userStatus.gameId || result.gameId || email);
            
            // console.log('QR code generated and displayed');
            lastSuccessfulSubmitTime = Date.now();

            // Bắt đầu kiểm tra trạng thái
            startCheckingPaymentStatus(email);
        } else {
            messageElement.innerHTML = '<h3 class="ladi-headline">Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại sau.</h3>';
            // console.log('Payment failed');
        }
    } catch (error) {
        console.error('Error in handleSubmit:', error);
        messageElement.innerHTML = '<h3 class="ladi-headline">Có lỗi xảy ra. Vui lòng thử lại sau.</h3>';
    } finally {
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.textContent = originalButtonText;
    }
}

function startCheckingPaymentStatus(email) {
    if (currentCheckInterval) {
        clearInterval(currentCheckInterval);
    }

    currentCheckInterval = setInterval(async () => {
        const status = await getUserStatus();
        // console.log('Checking payment status:', status);

        if (status.hasPaid && status.email === email) {
            if (status.statusK === 'Done' && status.statusL === 'Done') {
                clearInterval(currentCheckInterval);
                // Ẩn QR code
                document.getElementById('GROUP121').style = 'display:none !important';
                // Hiển thị GROUP109
                document.getElementById('GROUP127').style = 'display:block !important';
                document.getElementById('SECTION1').style = 'height: 750px;'
                document.getElementById('message').innerHTML = '';
            } else if (status.statusK === 'No' && status.statusL === 'No') {
                clearInterval(currentCheckInterval);
                // Ẩn QR code
                document.getElementById('GROUP125').style = 'display:block !important';
                // Hiển thị GROUP120
                document.getElementById('GROUP121').style = 'display:none !important';
                document.getElementById('SECTION1').style = 'height: 450px;'
                document.getElementById('message').innerHTML = '';
            }
        }
    }, 3000); // Kiểm tra mỗi 5 giây
}


document.addEventListener('DOMContentLoaded', async () => {
    initializeUI();
    await checkUserStatusAndUpdateUI();
});

// Thêm một event listener cho khi trang được focus lại
window.addEventListener('focus', async () => {
    await checkUserStatusAndUpdateUI();
});

// Hàm để xác minh rằng tất cả các ID HTML cần thiết tồn tại trong trang
function verifyHtmlIds() {
    const requiredIds = [
        'paymentForm', 'submit-btn', 'message', 'email', 'amount',
        'qrCodeContainer', 'GROUP105', 'GROUP39', 'bankName',
        'accountNumber', 'accountName', 'paymentAmount', 'transferContent'
    ];

    const missingIds = requiredIds.filter(id => !document.getElementById(id));
    if (missingIds.length > 0) {
        console.error('Missing HTML elements with IDs:', missingIds);
    } else {
        // console.log('All required HTML elements are present in the document.');
    }
}

// Gọi hàm xác minh khi trang được tải
document.addEventListener('DOMContentLoaded', verifyHtmlIds);

// Thêm xử lý lỗi toàn cục
window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
});

// Logging để debug
// console.log('Payment script loaded and initialized');
// ... (giữ nguyên toàn bộ code hiện tại)
