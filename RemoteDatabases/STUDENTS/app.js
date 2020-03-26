const studentsContainer = document.querySelector('tbody');

fetch('https://booksdb-bd267.firebaseio.com/students.json')
    .then(res => res.json())
    .then(res => {
        studentsContainer.innerHTML = '';

        const sortedStudents = Object.keys(res).sort((a, b) => res[a].id - res[b].id);

        sortedStudents.forEach(myId => {
            const student = res[myId];

            studentsContainer.innerHTML +=
                `<tr id="data-${myId}">
                    <td>${student.id}</td>
                    <td>${student.firstName}</td>
                    <td>${student.lastName}</td>
                    <td>${student.faculty}</td>
                    <td>${student.grade}</td>
                </tr>`;
        });
    });
