const template = Handlebars.compile(document.getElementById('cat-template').textContent);
document.getElementById('allCats').innerHTML = template({cats});

function onShowClick(btn) {
    if (btn.textContent === 'Show status code') {
        btn.textContent = 'Hide status code';
        btn.nextElementSibling.style.display = 'block';
    } else {
        btn.textContent = 'Show status code';
        btn.nextElementSibling.style.display = 'none';
    }
}
