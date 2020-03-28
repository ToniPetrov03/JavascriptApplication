const root = document.getElementById('root');
const towns = document.getElementById('towns');

document.getElementById('btnLoadTowns').addEventListener('click', onLoadClick);

function onLoadClick() {
    const template = Handlebars.compile(document.getElementById('towns-template').textContent);

    root.innerHTML = template({towns: towns.value.split(', ')})
}
