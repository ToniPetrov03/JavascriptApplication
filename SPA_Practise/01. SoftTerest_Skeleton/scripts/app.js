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
    this.get('#/dashboard', dashboardViewHandler);
    this.get('#/create', createViewHandler);
    this.post('#/create', () => false);
    this.get('#/details/:id', detailsViewHandler);
    this.post('#/details/:id', () => false);

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

    this.loggedIn = !!sessionStorage.getItem('token');

    this.hrefImage = this.loggedIn ? '#/dashboard' : '#/home'
}

async function homeViewHandler() {
    await applyCommon.call(this);


    await this.partial('./templates/home/home.hbs')
}

async function registerViewHandler() {
    await applyCommon.call(this);
    this.partials.registerForm = await this.load('./templates/register/registerForm.hbs');

    await this.partial('./templates/register/pageRegister.hbs');

    const formRef = document.getElementById('register-form');

    formRef.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = createFormEntity(formRef, ['username', 'password', 'repeatPassword']);

        const {username, password, repeatPassword} = form.getValue();

        if (password !== repeatPassword) return;

        const {user} = await firebase.auth().createUserWithEmailAndPassword(username, password);

        const token = await firebase.auth().currentUser.getIdToken();

        sessionStorage.setItem('token', token);
        sessionStorage.setItem('email', user.email);

        this.redirect(['#/dashboard'])
    });
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
        sessionStorage.setItem('email', user.email);

        this.redirect(['#/dashboard'])
    })
}

function logoutHandler() {
    firebase.auth().signOut();
}

async function dashboardViewHandler() {
    await applyCommon.call(this);
    this.partials.dashboard = await this.load('./templates/dashboard/dashboard.hbs');

    const token = sessionStorage.getItem('token');

    const treks = await fetch(`https://teammanagerdb-7567c.firebaseio.com/ideas.json?auth=${token}`).then(res => res.json());

    this.hasIdea = !!treks;

    if (this.hasIdea) {
        this.ideas = Object.entries(treks).map(([id, {title, imageURL}]) => ({id, title, imageURL}));
    }

    await this.partial('./templates/dashboard/dashboardPage.hbs');
}

async function createViewHandler() {
    await applyCommon.call(this);
    this.partials.createForm = await this.load('./templates/create/createForm.hbs');

    await this.partial('./templates/create/createPage.hbs');

    const formRef = document.getElementById('create-form');

    formRef.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = createFormEntity(formRef, ['title', 'description', 'imageURL']);

        const token = sessionStorage.getItem('token');
        const author = sessionStorage.getItem('email');
        const idea = form.getValue();

        await fetch('https://teammanagerdb-7567c.firebaseio.com/ideas.json?auth=' + token,
            {
                method: 'POST',
                body: JSON.stringify({
                    ...idea,
                    author,
                    likes: 0
                })
            }
        ).then(res => res.json());

        this.redirect(['#/dashboard'])
    })
}

async function detailsViewHandler(req) {
    await applyCommon.call(this);
    this.partials.details = await this.load('./templates/details/details.hbs');

    const id = req.params.id;
    const token = sessionStorage.getItem('token');

    const idea = await fetch(`https://teammanagerdb-7567c.firebaseio.com/ideas/${id}.json?auth=${token}`).then(res => res.json());

    this.idea = {...idea, id};
    this.isAuthor = idea.author === sessionStorage.getItem('email');
    this.hasComment = !!idea.comments;

    await this.partial('./templates/details/detailsPage.hbs');

    const deleteBtn = document.getElementById('delete-' + id);

    deleteBtn && deleteBtn.addEventListener('click', async () => {
        await fetch(`https://teammanagerdb-7567c.firebaseio.com/ideas/${id}.json?auth=${token}`, {method: 'DELETE'});

        this.app.refresh();
    });

    const likeBtn = document.getElementById('like-' + id);

    likeBtn && likeBtn.addEventListener('click', async () => {
        await fetch(`https://teammanagerdb-7567c.firebaseio.com/ideas/${id}.json?auth=${token}`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    ...idea,
                    likes: ++idea.likes
                })
            }
        );

        this.app.refresh();
    });

    const commentBtn = document.getElementById('commentBtn-' + id);

    commentBtn && commentBtn.addEventListener('click', async () => {
        const comment = document.getElementById('comment-' + id);

        await fetch(`https://teammanagerdb-7567c.firebaseio.com/ideas/${id}.json?auth=${token}`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    ...idea,
                    comments: [...(idea.comments || []), {email: sessionStorage.getItem('email'), comment: comment.value}]
                })
            }
        );

        this.redirect(['#/details/' + id])
    });
}

