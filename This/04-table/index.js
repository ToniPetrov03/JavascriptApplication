function solve() {
    document.querySelectorAll('tbody tr').forEach(item => item.addEventListener('click', onClick));

    let clickedItem;

    function onClick(e) {
        const item = e.target.parentElement;

        if (clickedItem) {
            clickedItem.style.background = 'none';
        }

        if (clickedItem === item) {
            item.style.background = 'none';
            clickedItem = '';
        } else {
            item.style.background = '#413f5e';
            clickedItem = item;
        }
    }
}
