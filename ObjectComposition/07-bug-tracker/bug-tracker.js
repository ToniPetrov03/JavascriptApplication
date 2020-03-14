'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BugTracker = function (_React$Component) {
    _inherits(BugTracker, _React$Component);

    function BugTracker(props) {
        _classCallCheck(this, BugTracker);

        var _this = _possibleConstructorReturn(this, (BugTracker.__proto__ || Object.getPrototypeOf(BugTracker)).call(this, props));

        _this.showForm = function () {
            _this.setState(function (state) {
                return {
                    formShown: !state.formShown
                };
            });
        };

        _this.handleReport = function (e) {
            e.preventDefault();

            _this.setState(function (state) {
                return {
                    bugs: [state.newBug].concat(_toConsumableArray(state.bugs)),
                    newBug: { description: '', author: '', status: 'open', severity: 0, id: generateId() },
                    formShown: false
                };
            });
        };

        _this.handleDescriptionChange = function (e) {
            _this.setState({ newBug: Object.assign({}, _this.state.newBug, { description: e.target.value }) });
        };

        _this.handleAuthorChange = function (e) {
            _this.setState({ newBug: Object.assign({}, _this.state.newBug, { author: e.target.value }) });
        };

        _this.handleStatusChange = function (e) {
            _this.setState({ newBug: Object.assign({}, _this.state.newBug, { status: e.target.value }) });
        };

        _this.handleSeverityChange = function (e) {
            _this.setState({ newBug: Object.assign({}, _this.state.newBug, { severity: e.target.value }) });
        };

        _this.state = { bugs: [], formShown: false, newBug: { description: '', author: '', status: 'open', severity: 0, id: generateId() } };
        return _this;
    }

    _createClass(BugTracker, [{
        key: 'render',
        value: function render() {
            var _state = this.state,
                formShown = _state.formShown,
                newBug = _state.newBug,
                bugs = _state.bugs;


            return React.createElement(
                'div',
                { id: 'wrapper' },
                React.createElement(
                    'div',
                    { id: 'titlebar' },
                    'Bug tracker'
                ),
                React.createElement(
                    'div',
                    { id: 'actionbar' },
                    React.createElement(
                        'button',
                        { onClick: this.showForm },
                        formShown ? 'Cancel' : 'Report'
                    ),
                    formShown && React.createElement(BugForm, {
                        onSubmit: this.handleReport,
                        onDescriptionChange: this.handleDescriptionChange,
                        onAuthorChange: this.handleAuthorChange,
                        onStatusChange: this.handleStatusChange,
                        onSeverityChange: this.handleSeverityChange,
                        description: newBug.description,
                        author: newBug.author,
                        status: newBug.status,
                        severity: newBug.severity
                    })
                ),
                React.createElement(
                    'div',
                    { id: 'content' },
                    bugs.map(function (bug) {
                        return React.createElement(Bug, { key: bug.id, description: bug.description, author: bug.author, status: bug.status,
                            severity: bug.severity });
                    })
                )
            );
        }
    }]);

    return BugTracker;
}(React.Component);

var bugStatuses = { open: 'Open', in_progress: 'In Progress', closed: 'Closed' };

function Bug(_ref) {
    var description = _ref.description,
        author = _ref.author,
        status = _ref.status,
        severity = _ref.severity;

    return React.createElement(
        'div',
        { className: 'report' },
        React.createElement(
            'div',
            { className: 'body' },
            React.createElement(
                'p',
                null,
                description
            )
        ),
        React.createElement(
            'div',
            { className: 'title' },
            React.createElement(
                'span',
                { className: 'author' },
                'Submitted by: ',
                author
            ),
            React.createElement(
                'span',
                { className: 'status' },
                bugStatuses[status],
                ' | ',
                severity
            )
        )
    );
}

function BugForm(_ref2) {
    var onSubmit = _ref2.onSubmit,
        onDescriptionChange = _ref2.onDescriptionChange,
        onAuthorChange = _ref2.onAuthorChange,
        onStatusChange = _ref2.onStatusChange,
        onSeverityChange = _ref2.onSeverityChange,
        description = _ref2.description,
        author = _ref2.author,
        status = _ref2.status,
        severity = _ref2.severity;

    return React.createElement(
        'form',
        { onSubmit: onSubmit },
        React.createElement(
            'label',
            null,
            'Description:',
            React.createElement('input', { onChange: onDescriptionChange, value: description, type: 'text', name: 'description' })
        ),
        React.createElement(
            'label',
            null,
            'Author:',
            React.createElement('input', { onChange: onAuthorChange, value: author, type: 'text', name: 'author' })
        ),
        React.createElement(
            'label',
            null,
            'Status:',
            React.createElement(
                'select',
                { onChange: onStatusChange, value: status },
                React.createElement(
                    'option',
                    { value: 'open' },
                    'Open'
                ),
                React.createElement(
                    'option',
                    { value: 'in_progress' },
                    'In Progress'
                ),
                React.createElement(
                    'option',
                    { value: 'closed' },
                    'Closed'
                )
            )
        ),
        React.createElement(
            'label',
            null,
            'Severity:',
            React.createElement('input', { onChange: onSeverityChange, value: severity, type: 'number', name: 'severity' })
        ),
        React.createElement('input', { type: 'submit', value: 'Submit' })
    );
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

var bugTrackerContainer = document.querySelector('#bug-tracker-container');
ReactDOM.render(React.createElement(BugTracker, null), bugTrackerContainer);