'use strict';

class BugTracker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {bugs: [], formShown: false, newBug: {description: '', author: '', status: 'open', severity: 0, id: generateId()}};
    }

    render() {
        const {formShown, newBug, bugs} = this.state;

        return <div id="wrapper">
            <div id="titlebar">Bug tracker</div>
            <div id="actionbar">
                <button onClick={this.showForm}>{formShown ? 'Cancel' : 'Report'}</button>
                {formShown && <BugForm
                    onSubmit={this.handleReport}
                    onDescriptionChange={this.handleDescriptionChange}
                    onAuthorChange={this.handleAuthorChange}
                    onStatusChange={this.handleStatusChange}
                    onSeverityChange={this.handleSeverityChange}
                    description={newBug.description}
                    author={newBug.author}
                    status={newBug.status}
                    severity={newBug.severity}
                />}
            </div>
            <div id="content">
                {bugs.map(bug =>
                    <Bug key={bug.id} description={bug.description} author={bug.author} status={bug.status}
                         severity={bug.severity}/>
                )}
            </div>
        </div>
    }

    showForm = () => {
        this.setState(state => ({
            formShown: !state.formShown
        }));
    };

    handleReport = (e) => {
        e.preventDefault();

        this.setState(state => ({
            bugs: [state.newBug, ...state.bugs],
            newBug: {description: '', author: '', status: 'open', severity: 0, id: generateId()},
            formShown: false
        }));
    };

    handleDescriptionChange = (e) => {
        this.setState({newBug: {...this.state.newBug, description: e.target.value}});
    };

    handleAuthorChange = (e) => {
        this.setState({newBug: {...this.state.newBug, author: e.target.value}});
    };

    handleStatusChange = (e) => {
        this.setState({newBug: {...this.state.newBug, status: e.target.value}});
    };

    handleSeverityChange = (e) => {
        this.setState({newBug: {...this.state.newBug, severity: e.target.value}});
    };
}

const bugStatuses = {open: 'Open', in_progress: 'In Progress', closed: 'Closed'};

function Bug({description, author, status, severity}) {
    return <div className="report">
        <div className="body">
            <p>{description}</p>
        </div>
        <div className="title">
            <span className="author">Submitted by: {author}</span>
            <span className="status">{bugStatuses[status]} | {severity}</span>
        </div>
    </div>
}

function BugForm({onSubmit, onDescriptionChange, onAuthorChange, onStatusChange, onSeverityChange, description, author, status, severity}) {
    return <form onSubmit={onSubmit}>
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
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

let bugTrackerContainer = document.querySelector('#bug-tracker-container');
ReactDOM.render(<BugTracker/>, bugTrackerContainer);
