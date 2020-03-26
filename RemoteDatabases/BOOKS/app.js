const booksContainer = document.querySelector('tbody');

document.getElementById('loadBooks').addEventListener('click', onLoadClick);
document.getElementById('submit').addEventListener('click', onSubmitClick);

async function onLoadClick() {
    const books = await fetch('https://booksdb-bd267.firebaseio.com/books.json').then(x => x.json());

    booksContainer.innerHTML = '';

    Object.entries(books).forEach(([id, {title, author, isbn}]) => {
        booksContainer.innerHTML +=
            `<tr id="data-${id}">
                <td>${title}</td>
                <td>${author}</td>
                <td>${isbn}</td>
                <td>
                    <button id="edit-${id}">Edit</button>
                    <button id="delete-${id}">Delete</button>
                </td>
            </tr>`;

        setTimeout(() => {
            document.getElementById(`edit-${id}`).addEventListener('click', () => onEditClick(id, title, author, isbn))
        }, 0);

        setTimeout(() => {
            document.getElementById(`delete-${id}`).addEventListener('click', () => onDeleteClick(id))
        }, 0);
    });
}

function onSubmitClick(e) {
    e.preventDefault();

    const [title, author, isbn] = document.querySelectorAll('form > input');

    fetch('https://booksdb-bd267.firebaseio.com/books.json',
        {
            method: 'POST',
            body: JSON.stringify({
                title: title.value,
                author: author.value,
                isbn: isbn.value
            })
        })
        .then(() => {
            title.value = '';
            author.value = '';
            isbn.value = '';
        })
        .then(() => onLoadClick())
}

function onEditClick(id, title, author, isbn) {
    document.getElementById(`data-${id}`).innerHTML =
        `<td><input value="${title}"></td>
        <td><input value="${author}"></td>
        <td><input value="${isbn}"></td>
        <td>
            <button id="ready-${id}">Ready</button>
            <button id="cancel-${id}">Cancel</button>
        </td>`;

    document.getElementById(`ready-${id}`).addEventListener('click', onReadyClick);
    document.getElementById(`cancel-${id}`).addEventListener('click', onLoadClick);

    function onReadyClick() {
        const [title, author, isbn] = document.querySelectorAll(`#data-${id} > td > input`);

        fetch(`https://booksdb-bd267.firebaseio.com/books/${id}.json`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    title: title.value,
                    author: author.value,
                    isbn: isbn.value
                })
            })
            .then(() => onLoadClick())
    }
}

function onDeleteClick(id) {
    fetch(`https://booksdb-bd267.firebaseio.com/books/${id}.json`, {method: 'DELETE'})
        .then(() => onLoadClick());
}
