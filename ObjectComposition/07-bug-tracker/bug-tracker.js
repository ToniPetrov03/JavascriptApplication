function bugTracker() {
    const container = [];
    let selector = undefined;

    const report = (author, description, reproducible, severity) => {
        container.push({
            ID: container.length,
            author,
            description,
            reproducible,
            severity,
            status: 'Open'
        });

        draw();
    };

    const setStatus = (id, newStatus) => {
        container[id].status = newStatus;

        draw();
    };

    const remove = (id) => {
        container.splice(id, 1);

        draw();
    };

    const sort = (method) => {
        switch (method) {
            case 'author': container.sort((a, b) => a.author.localeCompare(b.author)); break;
            case 'severity': container.sort((a, b) => a.severity - b.severity); break;
            case 'ID': container.sort((a, b) => a.ID - b.ID); break;
        }

        draw();
    };

    const output = (sel) => {
        selector = sel;
    };

    function draw() {
        $(selector).html('');

        container.forEach(bug => {
            $(selector).append(
                `<div id="report_${bug.ID}" class="report">
                    <div class="body">
                        <p>${bug.description}</p>
                    </div>
                    <div class="title">
                        <span class="author">Submitted by: ${bug.author}</span>
                        <span class="status">${bug.status} | ${bug.severity}</span>
                    </div>
                </div>`
            )
        })
    }

    return {report, setStatus, remove, sort, output};
}
