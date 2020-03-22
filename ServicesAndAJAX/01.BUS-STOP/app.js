async function getInfo() {
    const stopId = document.getElementById('stopId');
    const buses = document.getElementById('buses');
    const stopName = document.getElementById('stopName');

    buses.innerHTML = '';
    stopName.textContent = '';

    try {
        const busInfo = await fetch(`https://judgetests.firebaseio.com/businfo/${stopId.value}.json`).then(x => x.json());

        stopName.textContent = busInfo.name;

        Object.entries(busInfo.buses).forEach(([busId, time]) => {
            const li = document.createElement('li');
            li.textContent = `Bus ${busId} arrives in ${time} minutes`;
            buses.appendChild(li);
        })
    } catch {
        stopName.textContent = 'Error'
    }
}
