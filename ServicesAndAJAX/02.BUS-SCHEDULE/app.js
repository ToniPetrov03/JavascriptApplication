function solve() {
    const [info] = document.getElementsByClassName('info');
    const departButton = document.getElementById('depart');
    const departArrive = document.getElementById('arrive');

    let nextStop = 'depot';
    let currStop = '';

    async function depart() {
        try {
            const stop = await fetch(`https://judgetests.firebaseio.com/schedule/${nextStop}.json`).then(x => x.json());

            info.textContent = `Next stop ${stop.name}`;

            departButton.disabled = true;
            departArrive.disabled = false;

            nextStop = stop.next;
            currStop = stop.name;
        } catch {
            info.textContent = 'Error';

            departButton.disabled = true;
            departArrive.disabled = true;
        }
    }

    function arrive() {
        info.textContent = `Arriving stop ${currStop}`;

        departButton.disabled = false;
        departArrive.disabled = true;
    }

    return {
        depart,
        arrive
    };
}

let result = solve();
