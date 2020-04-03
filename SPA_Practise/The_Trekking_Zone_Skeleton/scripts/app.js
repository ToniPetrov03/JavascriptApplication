import {createFormEntity} from './form-helpers.js';

// initialize the application

const app = Sammy('#main', function () {
    // include a plugin

    this.use('Handlebars', 'hbs');

    // define a 'route'

    this.get('#/', homeViewHandler);
    this.get('#/home', homeViewHandler);
    this.get('#/register', registerViewHandler);
    this.post('#/register', () => false);
    this.get('#/login', loginViewHandler);
    this.post('#/login', () => false);
    this.get('#/logout', logoutHandler);
    this.get('#/create', createViewHandler);
    this.post('#/create', () => false);
    this.get('#/details/:id', detailsViewHandler);
    this.get('#/edit/:id', editViewHandler);
    this.post('#/edit/:id', () => false);

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

    this.email = sessionStorage.getItem('email');
    this.loggedIn = !!sessionStorage.getItem('token');
}

async function homeViewHandler() {
    await applyCommon.call(this);

    const token = sessionStorage.getItem('token');

    if (!!token) {
        const treks = await fetch(`https://teammanagerdb-7567c.firebaseio.com/treks.json?auth=${token}`).then(res => res.json());

        this.hasTrek = !!treks;

        if (this.hasTrek) {
            this.treks = Object.entries(treks).map(([id, {location, imageURL}]) => ({id, location, imageURL}));
        }
    }

    await this.partial('./templates/home/home.hbs')
}

async function registerViewHandler() {
    await applyCommon.call(this);
    this.partials.registerForm = await this.load('./templates/register/registerForm.hbs');

    await this.partial('./templates/register/pageRegister.hbs');

    const formRef = document.getElementById('register-form');

    formRef.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = createFormEntity(formRef, ['email', 'password', 'rePassword']);

        const {email, password, rePassword} = form.getValue();

        if (password !== rePassword) return;

        const {user} = await firebase.auth().createUserWithEmailAndPassword(email, password);

        const token = await firebase.auth().currentUser.getIdToken();

        sessionStorage.setItem('token', token);
        sessionStorage.setItem('email', user.email);

        this.redirect(['#/home'])
    });
}

async function loginViewHandler() {
    await applyCommon.call(this);
    this.partials.loginForm = await this.load('./templates/login/loginForm.hbs');

    await this.partial('./templates/login/loginPage.hbs');

    const formRef = document.getElementById('login-form');

    formRef.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = createFormEntity(formRef, ['email', 'password']);

        const {email, password} = form.getValue();

        const {user} = await firebase.auth().signInWithEmailAndPassword(email, password);

        const token = await firebase.auth().currentUser.getIdToken();

        sessionStorage.setItem('token', token);
        sessionStorage.setItem('email', user.email);

        this.redirect(['#/home'])
    })
}

function logoutHandler() {
    firebase.auth().signOut();
}

async function createViewHandler() {
    await applyCommon.call(this);
    this.partials.createForm = await this.load('./templates/create/createForm.hbs');

    await this.partial('./templates/create/createPage.hbs');

    const formRef = document.getElementById('create-form');

    formRef.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = createFormEntity(formRef, ['location', 'dateTime', 'description', 'imageURL']);

        const token = sessionStorage.getItem('token');
        const author = sessionStorage.getItem('email');
        const trek = form.getValue();

        await fetch('https://teammanagerdb-7567c.firebaseio.com/treks.json?auth=' + token,
            {
                method: 'POST',
                body: JSON.stringify({
                    ...trek,
                    author,
                    likes: 0
                })
            }
        ).then(res => res.json());

        this.redirect(['#/home'])
    })
}

async function detailsViewHandler(req) {
    await applyCommon.call(this);
    this.partials.details = await this.load('./templates/details/details.hbs');

    const id = req.params.id;
    const token = sessionStorage.getItem('token');

    const trek = await fetch(`https://teammanagerdb-7567c.firebaseio.com/treks/${id}.json?auth=${token}`).then(res => res.json());

    this.trek = {...trek, id};
    this.isAuthor = trek.author === sessionStorage.getItem('email');

    await this.partial('./templates/details/detailsPage.hbs');

    const closeBtn = document.getElementById('close-' + id);

    closeBtn && closeBtn.addEventListener('click', async () => {
        await fetch(`https://teammanagerdb-7567c.firebaseio.com/treks/${id}.json?auth=${token}`, {method: 'DELETE'});

        this.app.refresh();
    });

    const likeBtn = document.getElementById('like-' + id);

    likeBtn && likeBtn.addEventListener('click', async () => {
        await fetch(`https://teammanagerdb-7567c.firebaseio.com/treks/${id}.json?auth=${token}`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    ...trek,
                    likes: ++trek.likes
                })
            }
        );

        this.app.refresh();
    });
}

async function editViewHandler(req) {
    await applyCommon.call(this);
    this.partials.editForm = await this.load('./templates/edit/editForm.hbs');

    const id = req.params.id;
    const token = sessionStorage.getItem('token');

    const trek = await fetch(`https://teammanagerdb-7567c.firebaseio.com/treks/${id}.json?auth=${token}`).then(res => res.json());

    this.trek = trek;

    await this.partial('./templates/edit/editPage.hbs');

    const formRef = document.getElementById('edit-form');
    const form = createFormEntity(formRef, ['location', 'dateTime', 'description', 'imageURL']);

    form.setValue(trek);

    formRef.addEventListener('submit', async (e) => {
        e.preventDefault();

        const {location, dateTime, description, imageURL} = form.getValue();

        await fetch(`https://teammanagerdb-7567c.firebaseio.com/treks/${id}.json?auth=${token}`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    ...trek, location, dateTime, description, imageURL
                })
            }
        ).then(res => res.json());

        this.redirect(['#/details/' + id])
    })
}
