function attachEvents() {
    const phonebook = document.getElementById('phonebook');
    const newPersonName = document.getElementById('person');
    const newPersonPhone = document.getElementById('phone');

    document.getElementById('btnLoad').addEventListener('click', onLoadBtnClick);
    document.getElementById('btnCreate').addEventListener('click', onCreatBtnClick);

    function onLoadBtnClick() {
        fetch('https://phonebook-nakov.firebaseio.com/phonebook.json')
            .then(x => x.json())
            .then(x => {
                if (phonebook.innerHTML) {
                    phonebook.innerHTML = '';
                }

                Object.entries(x).forEach(([id, {person, phone}]) => {
                    const li = document.createElement('li');
                    li.textContent = `${person}: ${phone}`;

                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Delete';

                    deleteBtn.addEventListener('click', () => {
                        fetch(`https://phonebook-nakov.firebaseio.com/phonebook/${id}.json`, {method: 'DELETE'});
                        li.remove()
                    });

                    li.appendChild(deleteBtn);
                    phonebook.appendChild(li);
                })
            })
    }

    function onCreatBtnClick() {
        fetch('https://phonebook-nakov.firebaseio.com/phonebook.json',
            {
                method: 'POST',
                body: JSON.stringify({
                    person: newPersonName.value,
                    phone: newPersonPhone.value
                })
            });

        newPersonName.value = '';
        newPersonPhone.value = '';
    }
}

attachEvents();