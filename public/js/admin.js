const deleteProduct = (btn) => {
    const productId = btn.parentNode.querySelector('[name=productId').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf').value;
    const element = btn.closest('article');

    fetch('/admin/product/' + productId, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    })
        .then(response => {
           return  response.json();
        })
        .then(data => {
            console.log(data);
            // won't work in IE
            // element.remove();
            // works in all browser
            element.parentNode.removeChild(element);
        })
        .catch(err => {
            console.log(err);
        })
};