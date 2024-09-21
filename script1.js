 var change_mail_input = `<input id="email" autocomplete="on" tabindex="2" name="email" required="" class="ladi-form-control-input" type="email" placeholder="Email" value="" required>`;

    var change_money_input = `<input tabindex="3" id="amount" name="number" required class="ladi-form-control-input" type="amount" placeholder="Số tiền (VND):" min="20000">`;
    
    var change_btn_submit = `<button id="submit-btn" class="ladi-element submit-btn" type="submit"><p class="submit-headline">Mua Ngay</p></button>`;

    const mail_input = document.getElementById('FORM_ITEM9').querySelector('.ladi-form-item').innerHTML = change_mail_input;
    
    const money_input = document.getElementById('FORM_ITEM10').querySelector('.ladi-form-item').innerHTML = change_money_input;
    
    const button_submit = document.getElementById('BUTTON18').innerHTML = change_btn_submit;
    
    const FORM5 = document.getElementById('FORM5').querySelector('form').setAttribute('id', 'paymentForm');
    
   document.addEventListener('DOMContentLoaded', function() {
          // Lấy tất cả các phần tử có class 'lazy-load'
const lazyLoadElements = document.querySelectorAll('.lazy-load');

// Lặp qua từng phần tử và loại bỏ class 'lazy-load'
lazyLoadElements.forEach(element => {
  element.classList.remove('lazy-load');
});

    // Tìm button trong form có id "payment" và chỉ button đó có class "ladi-hidden"
const specificButton = document.querySelector('#paymentForm button.ladi-hidden');

if (specificButton) {
    console.log('Đã tìm thấy button, đang xóa...');
    
    // Xóa button khỏi DOM
    specificButton.remove();
    
    console.log('Button đã được xóa thành công.');
} else {
    console.log('Không tìm thấy button phù hợp với điều kiện.');
}
});
function initMultiTabDetection() {
    const channel = new BroadcastChannel('payment_tab_monitor');
    const tabId = generateUniqueTabId();
    console.log('Tab initialized with ID:', tabId);

    let isMainTab = false;
    let lastUpdateTime = 0;

    function generateUniqueTabId() {
        return 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function updateTabStatus() {
        const currentTime = Date.now();
        if (currentTime - lastUpdateTime < 1000) {
            // Ngăn chặn cập nhật quá nhanh, đặc biệt hữu ích cho pull-to-refresh
            return;
        }
        lastUpdateTime = currentTime;

        cleanupInactiveTabs();
        const activeTabs = getActiveTabs();
        console.log('Active tabs count:', activeTabs.length);

        if (activeTabs.length === 1 || isMobileDevice()) {
            // Nếu chỉ có một tab hoặc đang trên thiết bị di động, luôn coi là tab chính
            setMainTab(tabId);
        } else {
            const mainTabId = localStorage.getItem('mainPaymentTab');
            if (!mainTabId || !activeTabs.includes(mainTabId)) {
                setMainTab(tabId);
            } else {
                isMainTab = (mainTabId === tabId);
            }
        }

        localStorage.setItem(tabId, currentTime.toString());
        channel.postMessage({ type: 'tabCheck', id: tabId, time: currentTime });

        updateUI();
    }

    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    function cleanupInactiveTabs() {
        const currentTime = Date.now();
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('tab_')) {
                const tabTime = parseInt(localStorage.getItem(key));
                if (currentTime - tabTime > 5000) {
                    localStorage.removeItem(key);
                }
            }
        });
    }

    function getActiveTabs() {
        return Object.keys(localStorage).filter(key => key.startsWith('tab_'));
    }

    function setMainTab(id) {
        localStorage.setItem('mainPaymentTab', id);
        isMainTab = true;
    }

    function updateUI() {
        if (isMainTab || isMobileDevice()) {
            console.log('This is the main tab or mobile device');
            enableAllFunctions();
        } else {
            console.log('This is a secondary tab');
            disableAllFunctions();
            showSecondaryTabMessage();
        }
    }

    function enableAllFunctions() {
        document.body.style.pointerEvents = 'auto';
        document.body.style.opacity = '1';
        const messageElement = document.getElementById('secondaryTabMessage');
        if (messageElement) messageElement.style.display = 'none';
    }

    function disableAllFunctions() {
        document.body.style.pointerEvents = 'none';
        document.body.style.opacity = '0.5';
    }

    function showSecondaryTabMessage() {
        let messageElement = document.getElementById('secondaryTabMessage');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'secondaryTabMessage';
            messageElement.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background-color: #ff9800;
                color: white;
                text-align: center;
                padding: 10px;
                z-index: 9999;
                pointer-events: auto;
            `;
            document.body.appendChild(messageElement);
        }
        messageElement.textContent = 'Đây là tab phụ. Vui lòng sử dụng tab chính để thực hiện thanh toán.';
        messageElement.style.display = 'block';
    }

    channel.onmessage = (event) => {
        if (event.data.type === 'tabCheck' && event.data.id !== tabId) {
            updateTabStatus();
        }
    };

    function removeTabMark() {
        localStorage.removeItem(tabId);
        if (localStorage.getItem('mainPaymentTab') === tabId) {
            localStorage.removeItem('mainPaymentTab');
        }
    }

    setInterval(updateTabStatus, 2000);
    window.addEventListener('focus', updateTabStatus);
    window.addEventListener('beforeunload', removeTabMark);
    window.addEventListener('load', updateTabStatus);

    // Xử lý đặc biệt cho pull-to-refresh trên iOS
    let lastTouchY = 0;
    document.addEventListener('touchstart', function(e) {
        lastTouchY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', function(e) {
        const touchY = e.touches[0].clientY;
        const touchYDelta = touchY - lastTouchY;
        if (touchYDelta > 0 && window.scrollY === 0) {
            // Có thể đang thực hiện pull-to-refresh
            updateTabStatus();
        }
        lastTouchY = touchY;
    }, { passive: true });

    // Khởi tạo ngay lập tức
    updateTabStatus();
}

// Cập nhật event listener DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initMultiTabDetection();
});

console.log('Payment script loaded and initialized with mobile-friendly multi-tab detection');
