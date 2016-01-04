var subtotal = document.querySelector('.js-total')
var itemList = document.querySelector('.item-list')
var priceFields = document.querySelectorAll('.item .js-item-price')
var total = document.querySelector('.js-total')
var checkoutButton = document.querySelector('.js-checkout-button')
var modalWrapper = document.querySelector('.js-modal-wrapper')


function handleCalculations() {
    var subTotalPrice = 0;
    priceFields = document.querySelectorAll('.item .js-item-price');

    for (var i = 0; i< priceFields.length; i++) {
        subTotalPrice += +priceFields[i].textContent;
    }
    subTotalPrice = subTotalPrice.toFixed();
    subtotal.textContent = subTotalPrice;
    total.textContent = ' ' + (+subTotalPrice).toFixed();

}

function changeQuantity(emitter, action) {
    var action = emitter.classList.contains('js-item-increase') ? 'increase' : 'decrease',
        quantityField = emitter.parentElement.querySelector('span'),
        quantity = +quantityField.getAttribute('data-quantity'),
        price;

    if (action === 'increase') {
        emitter.nextElementSibling.classList.remove('decrease--disabled');
    } else if (action === 'decrease') {
        if (quantity === 1) {
            emitter.classList.add('decrease--disabled');
        } else if (quantity === 0) {
            return
        }
    }

    quantityField.innerHTML = '<b>' + (action === 'increase' ? ++quantity : --quantity) + '</b> ' + (quantity > 1 ? 'items' : 'item');
    quantityField.setAttribute('data-quantity', quantity);

    price = emitter.parentElement.parentElement.parentElement.querySelector('.js-item-price');

    price.textContent = (quantity * price.getAttribute('data-price'));
    total = price.textContent;

    handleCalculations()
}

itemList.addEventListener('click', function (e) {
    var target = e.target,
        classList = target.classList;

    if (classList.contains('js-item-increase') || classList.contains('js-item-decrease')) {
        changeQuantity(target)
    }
});

checkoutButton.addEventListener('click', function () {
    modalWrapper.classList.add('is-visible')
});

