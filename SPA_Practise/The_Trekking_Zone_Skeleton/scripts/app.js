import {createFormEntity} from './form-helpers.js';
import {createNotification} from './notifications-helper.js';

const notification = createNotification({
    duration: 5000,
    successSelector: '#successBox',
    loadingSelector: '#loadingBox',
    errorSelector: '#errorBox',
});

async function init() {
    const templates = await Promise.all([
        fetch('./templates/index.hbs').then(r => r.text()),
        fetch('./templates/header.hbs').then(r => r.text()),
        fetch('./templates/notifications.hbs').then(r => r.text()),
        fetch('./templates/footer.hbs').then(r => r.text()),
    ]);

    const [index, header, notifications, footer] = templates.map(x => Handlebars.compile(x));

    Handlebars.registerPartial('header', header);
    Handlebars.registerPartial('notifications', notifications);
    Handlebars.registerPartial('footer', footer);

    document.getElementById('appContainer').innerHTML = index({
        email: sessionStorage.getItem('email'),
        loggedIn: !!sessionStorage.getItem('token')
    });

    const main = Sammy('#main', async function () {
        this.use('Handlebars', 'hbs');

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
        this.get('#/profile', profileViewHandler);

        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                const token = await firebase.auth().currentUser.getIdToken();

                sessionStorage.setItem('token', token);
                sessionStorage.setItem('email', user.email);
            } else {
                if (sessionStorage.getItem('token')) {
                    sessionStorage.clear();
                    this.setLocation(['#/login']);
                } else {
                    this.setLocation(['#/']);
                }
            }
        });
    });

    main.run('#/');
}

init();

async function homeViewHandler() {
    const token = sessionStorage.getItem('token');
    this.loggedIn = !!sessionStorage.getItem('token');

    if (!!token) {
        const treks = await fetch(`https://teammanagerdb-7567c.firebaseio.com/treks.json?auth=${token}`).then(res => res.json());

        this.hasTrek = !!treks;

        if (this.hasTrek) {
            this.treks = Object
                .entries(treks)
                .map(([id, {location, imageURL, likes}]) => ({id, location, imageURL, likes}))
                .sort((a, b) => b.likes - a.likes);
        }
    }

    await this.partial('./templates/home.hbs')
}

async function registerViewHandler() {
    await this.partial('./templates/registerForm.hbs');

    const formRef = document.getElementById('register-form');

    formRef.addEventListener('submit', async (e) => {
        e.preventDefault();

        notification.loading();

        try {
            const form = createFormEntity(formRef, ['email', 'password', 'rePassword']);

            const {email, password, rePassword} = form.getValue();

            if (password !== rePassword) throw new Error('Passwords not matching.');

            await firebase.auth().createUserWithEmailAndPassword(email, password);

            notification.clearLoading();
            notification.success('Successfully registered user.');

            this.redirect(['#/home'])
        } catch (e) {
            notification.clearLoading();
            notification.error(e);
        }
    });
}

async function loginViewHandler() {
    await this.partial('./templates/loginForm.hbs');

    const formRef = document.getElementById('login-form');

    formRef.addEventListener('submit', async (e) => {
        e.preventDefault();

        notification.loading();

        try {
            const form = createFormEntity(formRef, ['email', 'password']);

            const {email, password} = form.getValue();

            await firebase.auth().signInWithEmailAndPassword(email, password);

            notification.clearLoading();
            notification.success('Successfully logged user.');

            this.redirect(['#/home'])
        } catch (e) {
            notification.clearLoading();
            notification.error(e);
        }
    })
}

async function logoutHandler() {
    notification.loading();

    await firebase.auth().signOut();

    notification.clearLoading();
    notification.success('Logout successful.');
}

async function createViewHandler() {
    await this.partial('./templates/createForm.hbs');

    const formRef = document.getElementById('create-form');

    formRef.addEventListener('submit', async (e) => {
        e.preventDefault();

        notification.loading();

        const form = createFormEntity(formRef, ['location', 'dateTime', 'description', 'imageURL']);

        const token = sessionStorage.getItem('token');
        const author = sessionStorage.getItem('email');
        const trek = form.getValue();

        const trekRes = await fetch('https://teammanagerdb-7567c.firebaseio.com/treks.json?auth=' + token,
            {
                method: 'POST',
                body: JSON.stringify({
                    ...trek,
                    author,
                    likes: 0
                })
            }
        ).then(res => res.json());

        notification.clearLoading();
        notification.success('Trek created successfully.');

        this.redirect(['#/details/' + trekRes.name])
    })
}

async function detailsViewHandler(req) {
    const id = req.params.id;
    const token = sessionStorage.getItem('token');

    const trek = await fetch(`https://teammanagerdb-7567c.firebaseio.com/treks/${id}.json?auth=${token}`).then(res => res.json());

    this.trek = {...trek, id};
    this.isAuthor = trek.author === sessionStorage.getItem('email');

    await this.partial('./templates/details.hbs');

    const closeBtn = document.getElementById('close-' + id);

    closeBtn && closeBtn.addEventListener('click', async () => {
        notification.loading();

        await fetch(`https://teammanagerdb-7567c.firebaseio.com/treks/${id}.json?auth=${token}`, {method: 'DELETE'});

        notification.clearLoading();
        notification.success('You closed the trek successfully.');

        this.app.refresh();
    });

    const likeBtn = document.getElementById('like-' + id);

    likeBtn && likeBtn.addEventListener('click', async () => {
        notification.loading();

        await fetch(`https://teammanagerdb-7567c.firebaseio.com/treks/${id}.json?auth=${token}`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    ...trek,
                    likes: ++trek.likes
                })
            }
        );

        notification.clearLoading();
        notification.success('You liked the trek successfully.');

        this.app.refresh();
    });
}

async function editViewHandler(req) {
    const id = req.params.id;
    const token = sessionStorage.getItem('token');

    const trek = await fetch(`https://teammanagerdb-7567c.firebaseio.com/treks/${id}.json?auth=${token}`).then(res => res.json());

    this.trek = {...trek, id};

    await this.partial('./templates/editForm.hbs');

    const formRef = document.getElementById('edit-form');
    const form = createFormEntity(formRef, ['location', 'dateTime', 'description', 'imageURL']);

    form.setValue(trek);

    formRef.addEventListener('submit', async (e) => {
        e.preventDefault();

        notification.loading();

        const {location, dateTime, description, imageURL} = form.getValue();

        await fetch(`https://teammanagerdb-7567c.firebaseio.com/treks/${id}.json?auth=${token}`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    ...trek, location, dateTime, description, imageURL
                })
            }
        ).then(res => res.json());

        notification.clearLoading();
        notification.success('Trek edited successfully.');

        this.redirect(['#/details/' + id])
    })
}

async function profileViewHandler() {
    const email = sessionStorage.getItem('email');
    const token = sessionStorage.getItem('token');

    const treks = await fetch(`https://teammanagerdb-7567c.firebaseio.com/treks.json?auth=${token}`).then(res => res.json());

    const organizedTreks = Object.values(treks).filter(({author, location}) => author === email);

    this.email = email;
    this.numOrganizedTreks = organizedTreks.length;
    this.organizedTreks = organizedTreks;

    await this.partial('./templates/profile.hbs');
}
