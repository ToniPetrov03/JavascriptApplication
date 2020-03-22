function attachEvents() {
    const messages = document.getElementById('messages');
    const author = document.getElementById('author');
    const content = document.getElementById('content');

    document.getElementById('submit').addEventListener('click', onSendClick);
    document.getElementById('refresh').addEventListener('click', onRefreshClick);

    function onSendClick() {
        fetch('https://rest-messanger.firebaseio.com/messanger.json',
            {
                method: 'POST',
                body: JSON.stringify({
                    author: author.value,
                    content: content.value
                })
            });

        author.value = '';
        content.value = '';
    }

    function onRefreshClick() {
        fetch('https://rest-messanger.firebaseio.com/messanger.json')
            .then(x => x.json())
            .then(x => {
                messages.textContent = Object.values(x).map(({author, content}) => `${author}: ${content}`).join('\n')
            })
    }
}

attachEvents();
