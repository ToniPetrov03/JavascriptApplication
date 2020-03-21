'use strict';

class BugTracker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bugs: [],
            formShown: false,
            newBug: {description: '', author: '', status: 'open', severity: 0, id: generateId(), editing: false},
            sortFieldShown: false,
            criteria: 'author'
        };
    }

    render() {
        const {formShown, newBug, bugs, sortFieldShown, criteria} = this.state;

        return <div id="wrapper">
            <div id="titlebar">Bug tracker</div>
            <div id="actionbar">
                <button onClick={this.showForm}>{formShown ? 'Cancel' : 'Report'}</button>
                <button onClick={this.showSortField}>{sortFieldShown ? 'Cancel' : 'Sort'}</button>
                {formShown && <BugForm
                    onSubmit={this.handleReport}
                    onDescriptionChange={(e) => this.handleDataChange(e, 'description')}
                    onAuthorChange={(e) => this.handleDataChange(e, 'author')}
                    onStatusChange={(e) => this.handleDataChange(e, 'status')}
                    onSeverityChange={(e) => this.handleDataChange(e, 'severity')}
                    description={newBug.description}
                    author={newBug.author}
                    status={newBug.status}
                    severity={newBug.severity}
                />}
                {sortFieldShown && <SortField
                    onSubmit={this.handleSort}
                    onCriteriaChange={this.handleCriteriaChange}
                    criteria={criteria}
                />}
            </div>
            <div id="content">
                {bugs.map(bug =>
                    <Bug
                        key={bug.id}
                        description={bug.description}
                        author={bug.author}
                        status={bug.status}
                        severity={bug.severity}
                        onDelete={() => this.handleDelete(bug)}
                        toggleEdit={() => this.handleToggleEdit(bug)}
                        editing={bug.editing}
                        onEditSubmit={() => this.handleToggleEdit(bug)}
                        onDescriptionChange={(e) => this.handleDataChange(e, 'description', bug)}
                        onAuthorChange={(e) => this.handleDataChange(e, 'author', bug)}
                        onStatusChange={(e) => this.handleDataChange(e, 'status', bug)}
                        onSeverityChange={(e) => this.handleDataChange(e, 'severity', bug)}
                    />
                )}
            </div>
        </div>
    }

    showForm = () => {
        this.setState(state => ({formShown: !state.formShown}));
    };

    handleReport = (e) => {
        e.preventDefault();

        this.setState(state => ({
            bugs: [state.newBug, ...state.bugs],
            newBug: {description: '', author: '', status: 'open', severity: 0, id: generateId(), editing: false},
            formShown: false
        }));
    };

    handleDataChange = (e, prop, bug) => {
        e.persist();
        const value = e.target.value;

        if (bug) {
            this.setState(state => ({
                bugs: state.bugs.map(x => {
                    if (x.id === bug.id) {
                        return {...x, [prop]: value}
                    }

                    return x;
                })
            }))
        } else {
            this.setState(state => ({newBug: {...state.newBug, [prop]: value}}));
        }
    };

    handleDelete = (bug) => {
        this.setState(state => ({bugs: state.bugs.filter(x => x.id !== bug.id)}));
    };

    handleToggleEdit = (bug) => {
        this.setState(state => ({
            bugs: state.bugs.map(x => {
                if (x.id === bug.id) {
                    return {...x, editing: !x.editing}
                }

                return x;
            })
        }))
    };

    showSortField = () => {
        this.setState(state => ({sortFieldShown: !state.sortFieldShown}));
    };

    handleSort = (e) => {
        e.preventDefault();

        switch (this.state.criteria) {
            case 'author':
                this.setState(state => ({
                    bugs: [...state.bugs].sort((a, b) => a.author.localeCompare(b.author)),
                    sortFieldShown: false
                }));
                break;
            case 'severity':
                this.setState(state => ({
                    bugs: [...state.bugs].sort((a, b) => a.severity - b.severity),
                    sortFieldShown: false
                }));
                break;
        }
    };

    handleCriteriaChange = (e) => {
        this.setState({criteria: e.target.value});
    };
}

const bugStatuses = {open: 'Open', in_progress: 'In Progress', closed: 'Closed'};

function Bug({description, author, status, severity, onDelete, toggleEdit, editing, onEditSubmit, onDescriptionChange, onAuthorChange, onStatusChange, onSeverityChange}) {
    return (
        <div className="report">
            {editing
                ?
                <div>
                    <BugForm
                        onSubmit={onEditSubmit}
                        onDescriptionChange={onDescriptionChange}
                        onAuthorChange={onAuthorChange}
                        onStatusChange={onStatusChange}
                        onSeverityChange={onSeverityChange}
                        description={description}
                        author={author}
                        status={status}
                        severity={severity}
                    />
                    <button onClick={toggleEdit}>Cancel</button>
                </div>
                :
                <div>
                    <div className="body">
                        <p>{description}</p>
                    </div>
                    <div className="title">
                        <span className="author">Submitted by: {author}</span>
                        <span className="status">{bugStatuses[status]} | {severity}</span>
                    </div>
                    <div className="bug-actions">
                        <button onClick={toggleEdit}>Edit</button>
                        <button onClick={onDelete}>Delete</button>
                    </div>
                </div>
            }
        </div>
    )
}

function BugForm({onSubmit, onDescriptionChange, onAuthorChange, onStatusChange, onSeverityChange, description, author, status, severity}) {
    return (
        <form onSubmit={onSubmit}>
            <label>
                Description:
                <input onChange={onDescriptionChange} value={description} type="text" name="description"/>
            </label>
            <label>
                Author:
                <input onChange={onAuthorChange} value={author} type="text" name="author"/>
            </label>
            <label>
                Status:
                <select onChange={onStatusChange} value={status}>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                </select>
            </label>
            <label>
                Severity:
                <input onChange={onSeverityChange} value={severity} type="number" name="severity"/>
            </label>
            <input type="submit" value="Submit"/>
        </form>
    )
}

function SortField({onSubmit, onCriteriaChange, criteria}) {
    return (
        <form onSubmit={onSubmit}>
            <label>
                Sort by:
                <select onChange={onCriteriaChange} value={criteria}>
                    <option value="author">Author</option>
                    <option value="severity">Severity</option>
                </select>
            </label>
            <input type="submit" value="Submit"/>
        </form>
    )
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

let bugTrackerContainer = document.querySelector('#bug-tracker-container');
ReactDOM.render(<BugTracker/>, bugTrackerContainer);
