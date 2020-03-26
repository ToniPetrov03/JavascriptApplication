function attachEvents() {
    const playersContainer = document.getElementById('players');
    const canvas = document.getElementById('canvas');
    const inputName = document.getElementById('addName');

    const playersField = document.getElementById('playersField');
    const addPlayerField = document.getElementById('addPlayerField');

    const saveBtn = document.getElementById('save');
    const reloadBtn = document.getElementById('reload');

    document.getElementById('addPlayer').addEventListener('click', onAddPlayerClick);

    async function load() {
        const players = await fetch('https://booksdb-bd267.firebaseio.com/players.json').then(x => x.json());

        playersContainer.innerHTML = '';

        Object.entries(players).forEach(([id, {name, money, bullets}]) => {
            playersContainer.innerHTML +=
                `<div class="player" id="data-${id}">
                    <div class="row">
                        <label>Name:</label>
                        <label class="name">${name}</label>
                    </div>
                    <div class="row">
                        <label>Money:</label>
                        <label class="money">${money}</label>
                    </div>
                    <div class="row">
                        <label>Bullets:</label>
                        <label class="bullets">${bullets}</label>
                    </div>
                    <button id="play-${id}" class="play">Play</button>
                    <button id="delete-${id}" class="delete">Delete</button>
                </div>`;

            setTimeout(() => {
                document.getElementById(`play-${id}`).addEventListener('click', () =>
                    onPlayClick(id, {name, money, bullets}));

                document.getElementById(`delete-${id}`).addEventListener('click', () =>
                    onDeleteClick(id));
            });
        });
    }

    function onAddPlayerClick() {
        fetch('https://booksdb-bd267.firebaseio.com/players.json',
            {
                method: 'POST',
                body: JSON.stringify({
                    name: inputName.value,
                    money: 500,
                    bullets: 6
                })
            })
            .then(() => inputName.value = '')
            .then(() => load())
    }

    function onPlayClick(id, player) {
        playersField.style.display = 'none';
        addPlayerField.style.display = 'none';
        canvas.style.display = 'block';
        saveBtn.style.display = 'block';
        reloadBtn.style.display = 'block';

        loadCanvas(player);

        saveBtn.addEventListener('click', () => onSaveClick(id, player));
        reloadBtn.addEventListener('click', () => onReloadClick(id, player));
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyR') {
                onReloadClick(id, player)
            }
        });
    }

    function onDeleteClick(id) {
        fetch(`https://booksdb-bd267.firebaseio.com/players/${id}.json`, {method: 'DELETE'})
            .then(() => load())
    }

    function onSaveClick(id, player) {
        fetch(`https://booksdb-bd267.firebaseio.com/players/${id}.json`,
            {
                method: 'PUT',
                body: JSON.stringify({name: player.name, money: player.money, bullets: player.bullets})
            })
            .then(() => {
                playersField.style.display = 'block';
                addPlayerField.style.display = 'block';
                canvas.style.display = 'none';
                saveBtn.style.display = 'none';
                reloadBtn.style.display = 'none';

                clearInterval(canvas.intervalId)
            })
            .then(() => load());
    }

    function onReloadClick(id, player) {
        fetch(`https://booksdb-bd267.firebaseio.com/players/${id}.json`,
            {
                method: 'PUT',
                body: JSON.stringify({name: player.name, money: player.money -= 60, bullets: player.bullets += 6})
            })
    }

    load();
}
