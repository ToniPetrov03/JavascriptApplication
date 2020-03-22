function attachEvents() {
    const messagesContainer = document.getElementById('messages');
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
            })
            .then(() => {
                author.value = '';
                content.value = '';
            });
    }

    async function onRefreshClick() {
        const messages = await fetch('https://rest-messanger.firebaseio.com/messanger.json').then(x => x.json());

        messagesContainer.textContent = Object.values(messages).map(({author, content}) => `${author}: ${content}`).join('\n')
    }
}

attachEvents();
