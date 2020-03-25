function attachEvents() {
    const catchesContainer = document.getElementById('catches');
    const [loadBtn, addBtn] = document.getElementsByTagName('button');

    loadBtn.addEventListener('click', onLoadClick);
    addBtn.addEventListener('click', onAddClick);

    async function onLoadClick() {
        const catches = await fetch('https://fisher-game.firebaseio.com/catches.json').then(x => x.json());

        catchesContainer.innerHTML = '';

        Object.entries(catches).forEach(([id, {angler, bait, captureTime, location, species, weight}]) => {
            catchesContainer.innerHTML +=
                `<div class="catch" id="data-${id}">
                    <label>Angler</label>
                    <input type="text" class="angler" value="${angler}"/>
                    <hr>
                    <label>Weight</label>
                    <input type="number" class="weight" value="${weight}"/>
                    <hr>
                    <label>Species</label>
                    <input type="text" class="species" value="${species}"/>
                    <hr>
                    <label>Location</label>
                    <input type="text" class="location" value="${location}"/>
                    <hr>
                    <label>Bait</label>
                    <input type="text" class="bait" value="${bait}"/>
                    <hr>
                    <label>Capture Time</label>
                    <input type="number" class="captureTime" value="${captureTime}"/>
                    <hr>
                    <button class="update" id="update-${id}">Update</button>
                    <button class="delete" id="delete-${id}">Delete</button>
                </div>`;

            setTimeout(() => {
                document.getElementById(`update-${id}`).addEventListener('click', () => onUpdateClick(id));
            }, 0);

            setTimeout(() => {
                document.getElementById(`delete-${id}`).addEventListener('click', () => onDeleteClick(id));
            }, 0);
        })
    }

    function onAddClick() {
        const [angler, weight, species, location, bait, captureTime] = document.querySelectorAll('#addForm > input');

        fetch('https://fisher-game.firebaseio.com/catches.json',
            {
                method: 'POST',
                body: JSON.stringify({
                    angler: angler.value,
                    weight: weight.value,
                    species: species.value,
                    location: location.value,
                    bait: bait.value,
                    captureTime: captureTime.value
                })
            })
            .then(() => {
                angler.value = '';
                weight.value = '';
                species.value = '';
                location.value = '';
                bait.value = '';
                captureTime.value = '';
            })
            .then(() => onLoadClick());
    }

    function onUpdateClick(id) {
        const [angler, weight, species, location, bait, captureTime] = document.querySelectorAll(`#data-${id} > input`);

        fetch(`https://fisher-game.firebaseio.com/catches/${id}.json`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    angler: angler.value,
                    weight: weight.value,
                    species: species.value,
                    location: location.value,
                    bait: bait.value,
                    captureTime: captureTime.value
                })
            })
            .then(() => onLoadClick());
    }

    function onDeleteClick(id) {
        fetch(`https://fisher-game.firebaseio.com/catches/${id}.json`, {method: 'DELETE'})
            .then(() => onLoadClick())
    }
}

attachEvents();
