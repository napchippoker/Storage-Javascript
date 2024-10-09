var change_mail_input = `<input id="gameId" autocomplete="on" tabindex="2" name="gameId" class="ladi-form-control-input" type="text" placeholder="ID Game" required>`;

var change_money_input = `<input tabindex="3" id="amount" name="number" required class="ladi-form-control-input" type="amount" placeholder="Số tiền (VND):" min="20000">`;

var change_btn_submit = `<button id="submit-btn" class="ladi-element submit-btn" type="submit"><p id="submit-headline" class="submit-headline">Mua Ngay</p></button>`;

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

 // Hàm xóa div có class 'ladipage-message'
        function removeMessageDiv() {
            const messageDiv = document.querySelector('.ladipage-message');
            if (messageDiv) {
                messageDiv.remove();
                console.log("Div with class 'ladipage-message' has been removed.");
            }
        }

        // Sử dụng MutationObserver để theo dõi các thay đổi trong DOM
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // Kiểm tra nếu div với class 'ladipage-message' được thêm vào DOM
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.classList && node.classList.contains('ladipage-message')) {
                            removeMessageDiv();
                        }
                    });
                }
            });
        });

        // Bắt đầu theo dõi các thay đổi trong toàn bộ body
        observer.observe(document.body, { childList: true, subtree: true });

        // Gọi hàm removeMessageDiv nếu div đã tồn tại từ trước
        removeMessageDiv();
  
