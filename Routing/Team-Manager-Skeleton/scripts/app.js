import {createFormEntity} from './form-helpers.js';

// initialize the application


const app = Sammy('#main', function () {
    // include a plugin

    this.use('Handlebars', 'hbs');

    // define a 'route'

    this.get('#/', homeViewHandler);
    this.get('#/home', homeViewHandler);
    this.get('#/about', aboutViewHandler);
    this.get('#/login', loginViewHandler);
    this.post('#/login', () => false);
    this.get('#/register', registerViewHandler);
    this.post('#/register', () => false);
    this.get('#/logout', logoutHandler);
    this.get('#/catalog', catalogsViewHandler);
    this.get('#/catalog/:id', catalogViewHandler);
    this.get('#/edit/:id', editViewHandler);
    this.post('#/edit/:id', () => false);
    this.get('#/create', createViewHandler);
    this.post('#/create', () => false);
    this.post('#/join/:id', () => false);
    this.post('#/leave', () => false);

    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            if (sessionStorage.getItem('token')) {
                sessionStorage.clear();
                this.setLocation(['#/login']);
            } else {
                this.setLocation(['#/']);
            }
        }
    });
});

// start the application

app.run('#/');

async function applyCommon() {
    this.partials = {
        header: await this.load('./templates/common/header.hbs'),
        footer: await this.load('./templates/common/footer.hbs'),
    };

    this.username = sessionStorage.getItem('username');
    this.loggedIn = !!sessionStorage.getItem('token');
}

async function homeViewHandler() {
    await applyCommon.call(this);
    await this.partial('./templates/home/home.hbs')
}

async function aboutViewHandler() {
    await applyCommon.call(this);
    await this.partial('./templates/about/about.hbs')
}

async function loginViewHandler() {
    await applyCommon.call(this);
    this.partials.loginForm = await this.load('./templates/login/loginForm.hbs');

    await this.partial('./templates/login/loginPage.hbs');

    const formRef = document.getElementById('login-form');

    formRef.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = createFormEntity(formRef, ['username', 'password']);

        const {username, password} = form.getValue();

        const {user} = await firebase.auth().signInWithEmailAndPassword(username, password);

        const token = await firebase.auth().currentUser.getIdToken();

        sessionStorage.setItem('token', token);
        sessionStorage.setItem('username', user.email);

        this.redirect(['#/home'])
    })
}

function logoutHandler() {
    firebase.auth().signOut();
}

async function registerViewHandler() {
    await applyCommon.call(this);
    this.partials.registerForm = await this.load('./templates/register/registerForm.hbs');

    await this.partial('./templates/register/registerPage.hbs');

    const formRef = document.getElementById('register-form');

    formRef.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = createFormEntity(formRef, ['username', 'password', 'repeatPassword']);

        const {username, password, repeatPassword} = form.getValue();

        if (password !== repeatPassword) return;

        const {user} = await firebase.auth().createUserWithEmailAndPassword(username, password);

        const token = await firebase.auth().currentUser.getIdToken();

        sessionStorage.setItem('username', user.email);
        sessionStorage.setItem('token', token);

        this.redirect(['#/home'])
    })
}

async function createViewHandler() {
    await applyCommon.call(this);
    this.partials.createForm = await this.load('./templates/create/createForm.hbs');

    await this.partial('./templates/create/createPage.hbs');

    const formRef = document.getElementById('create-form');

    formRef.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = createFormEntity(formRef, ['name', 'comment']);

        const token = sessionStorage.getItem('token');
        const author = sessionStorage.getItem('username');
        const team = form.getValue();

        await fetch('https://teammanagerdb-7567c.firebaseio.com/teams.json?auth=' + token,
            {
                method: 'POST',
                body: JSON.stringify({
                    ...team,
                    author,
                    members: [{username: author}]
                })
            }
        ).then(res => res.json());

        firebase.database().ref('users/' + firebase.auth().currentUser.uid).set({
            hasTeam: true
        });

        this.redirect(['#/catalog'])
    })
}

async function catalogsViewHandler() {
    await applyCommon.call(this);
    this.partials.team = await this.load('./templates/catalog/team.hbs');

    const token = sessionStorage.getItem('token');

    const teams = await fetch('https://teammanagerdb-7567c.firebaseio.com/teams.json?auth=' + token).then(res => res.json());

    this.teams = Object.entries(teams).map(([_id, {comment, name}]) => ({_id, comment, name}));

    const user = firebase.database().ref('users/' + firebase.auth().currentUser.uid);

    user.on('value', (snapshot) => {
       this.hasNoTeam = !snapshot.val().hasTeam;
    });

    await this.partial('./templates/catalog/teamCatalog.hbs');
}

async function catalogViewHandler(req) {
    await applyCommon.call(this);
    const id = req.params.id;

    const token = sessionStorage.getItem('token');

    const team = await fetch(`https://teammanagerdb-7567c.firebaseio.com/teams/${id}.json?auth=${token}`).then(res => res.json());

    const currUser = sessionStorage.getItem('username');

    this.isOnTeam = (team.members || []).some(({username}) => username === currUser);
    this.isAuthor = currUser === team.author;
    this.teamId = id;
    this.members = team.members;
    this.name = team.name;
    this.comment = team.comment;
    const user = firebase.database().ref('users/' + firebase.auth().currentUser.uid);
    user.on('value', (snapshot) => {
        this.hasNoTeam = !snapshot.val().hasTeam;
    });

    this.partials.teamControls = await this.load('./templates/catalog/teamControls.hbs');
    this.partials.teamMember = await this.load('./templates/catalog/teamMember.hbs');
    await this.partial('./templates/catalog/details.hbs');

    const joinBtn = document.getElementById('join-btn');

    joinBtn && joinBtn.addEventListener('click', async () => {
        await fetch(`https://teammanagerdb-7567c.firebaseio.com/teams/${id}.json?auth=${token}`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    ...team, members: [...(team.members || []), {username: currUser}]
                })
            }
        ).then(res => res.json());

        firebase.database().ref('users/' + firebase.auth().currentUser.uid).set({
            hasTeam: true
        });

        this.app.refresh();
    });

    const leaveBtn = document.getElementById('leave-btn');

    leaveBtn && leaveBtn.addEventListener('click', async () => {
        await fetch(`https://teammanagerdb-7567c.firebaseio.com/teams/${id}.json?auth=${token}`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    ...team, members: (team.members || []).filter(({username}) => username !== currUser)
                })
            }
        ).then(res => res.json());

        firebase.database().ref('users/' + firebase.auth().currentUser.uid).set({
            hasTeam: false
        });

        this.app.refresh();
    });
}

async function editViewHandler(req) {
    await applyCommon.call(this);
    this.partials.editForm = await this.load('./templates/edit/editForm.hbs');

    const id = req.params.id;
    const token = sessionStorage.getItem('token');

    const team = await fetch(`https://teammanagerdb-7567c.firebaseio.com/teams/${id}.json?auth=${token}`).then(res => res.json());

    this.teamId = id;
    this.name = team.name;
    this.comment = team.comment;

    await this.partial('./templates/edit/editPage.hbs');

    const formRef = document.getElementById('edit-form');
    const form = createFormEntity(formRef, ['name', 'comment']);

    form.setValue(team);

    formRef.addEventListener('submit', async (e) => {
        e.preventDefault();

        const {name, comment} = form.getValue();

        await fetch(`https://teammanagerdb-7567c.firebaseio.com/teams/${id}.json?auth=${token}`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    ...team, name, comment
                })
            }
        ).then(res => res.json());

        this.redirect(['#/catalog'])
    })
}
