const root = document.getElementById('root');
const towns = document.getElementById('towns');

document.getElementById('btnLoadTowns').addEventListener('click', onLoadClick);

async function onLoadClick() {
    const t = await fetch('./template.hbs').then(r => r.text());

    const template = Handlebars.compile(t);

    root.innerHTML = template({towns: towns.value.split(', ')})
}
