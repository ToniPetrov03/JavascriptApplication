function getInfo() {
    const stopId = document.getElementById('stopId');
    const buses = document.getElementById('buses');
    const stopName = document.getElementById('stopName');

    buses.innerHTML = '';
    stopName.textContent = '';

    fetch(`https://judgetests.firebaseio.com/businfo/${stopId.value}.json `)
        .then(x => x.json())
        .then(x => {
            stopName.textContent = x.name;

            Object.entries(x.buses).forEach(([busId, time]) => {
                const li = document.createElement('li');
                li.textContent = `Bus ${busId} arrives in ${time} minutes`;
                buses.appendChild(li);
            });
        })
        .catch(() => stopName.textContent = 'Error')
}
