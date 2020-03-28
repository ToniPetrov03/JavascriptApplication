const template = Handlebars.compile(document.getElementById('monkey-template').textContent);
document.querySelector('section').innerHTML += template({monkeys});

function onInfoClick(btn) {
    btn.nextElementSibling.style.display = 'block';
}
