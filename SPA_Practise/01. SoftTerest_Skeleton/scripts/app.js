import {createFormEntity} from './form-helpers.js';
import {createNotification} from './notifications-helper.js';

const notification = createNotification({
    duration: 5000,
    container: '#notifications',
    loadingSelector: '#loadingBox',
});

async function init() {
    const templates = await Promise.all([
        fetch('./templates/index.hbs').then(r => r.text()),
        fetch('./templates/header.hbs').then(r => r.text()),
        fetch('./templates/notifications.hbs').then(r => r.text()),
        fetch('./templates/footer.hbs').then(r => r.text()),
    ]);

    const [index, header, notifications, footer] = templates.map(x => Handlebars.compile(x));

    Handlebars.registerPartial('notifications', notifications);
    Handlebars.registerPartial('footer', footer);

    document.getElementById('appContainer').innerHTML = index();

    const renderHeader = () => document.getElementById('header-container').innerHTML = header({
        email: sessionStorage.getItem('email'),
        loggedIn: !!sessionStorage.getItem('token')
    });

    const main = Sammy('#main', async function () {
        this.use('Handlebars', 'hbs');

        this.get('#/', homeViewHandler);
        this.get('#/register', registerViewHandler);
        this.post('#/register', () => false);
        this.get('#/login', loginViewHandler);
        this.post('#/login', () => false);
        this.get('#/logout', logoutHandler);
        this.get('#/create', createViewHandler);
        this.post('#/create', () => false);
        this.get('#/details/:id', detailsViewHandler);
        this.post('#/details/:id', () => false);
        this.get('#/profile', profileViewHandler);

        firebase.auth().onAuthStateChanged(async (user) => {
            if (user && !sessionStorage.getItem('token')) {
                // logged in

                const token = await firebase.auth().currentUser.getIdToken();

                sessionStorage.setItem('token', token);
                sessionStorage.setItem('email', user.email);

                this.setLocation(['#/'])
            } else if (!user && sessionStorage.getItem('token')) {
                // logged out

                sessionStorage.clear();
                this.setLocation(['#/login']);
            }

            renderHeader();
        });
    });

    main.run('#/');
}

init();

async function homeViewHandler() {
    const token = sessionStorage.getItem('token');

    this.loggedIn = !!token;

    if (this.loggedIn) {
        const ideas = await fetch(`https://teammanagerdb-7567c.firebaseio.com/ideas.json?auth=${token}`).then(res => res.json());

        this.hasIdea = !!ideas;

        if (this.hasIdea) {
            this.ideas = Object
                .entries(ideas)
                .map(([id, {title, imageURL, likes}]) => ({id, title, imageURL, likes}))
                .sort((a, b) => b.likes - a.likes);
        }
    }

    await this.partial('./templates/home.hbs');
}

async function registerViewHandler() {
    await this.partial('./templates/registerForm.hbs');

    const formRef = document.getElementById('register-form');

    formRef.addEventListener('submit', async (e) => {
        e.preventDefault();

        notification.loading();

        try {
            const form = createFormEntity(formRef, ['username', 'password', 'repeatPassword']);

            const {username, password, repeatPassword} = form.getValue();

            if (password !== repeatPassword) throw new Error('Passwords not matching.');

            await firebase.auth().createUserWithEmailAndPassword(username, password);

            notification.clearLoading();
            notification.success('Successfully registered user.');
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
            const form = createFormEntity(formRef, ['username', 'password']);

            const {username, password} = form.getValue();

            await firebase.auth().signInWithEmailAndPassword(username, password);

            notification.clearLoading();
            notification.success('Successfully logged user.');
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

        const form = createFormEntity(formRef, ['title', 'description', 'imageURL']);

        const token = sessionStorage.getItem('token');
        const author = sessionStorage.getItem('email');
        const idea = form.getValue();

        const ideaRef = await fetch(`https://teammanagerdb-7567c.firebaseio.com/ideas.json?auth=${token}`,
            {
                method: 'POST',
                body: JSON.stringify({
                    ...idea,
                    author,
                    likes: 0
                })
            }
        ).then(res => res.json());

        notification.clearLoading();
        notification.success('Idea created successfully.');

        this.redirect(['#/details/' + ideaRef.name])
    })
}

async function detailsViewHandler(req) {
    const id = req.params.id;
    const token = sessionStorage.getItem('token');

    const idea = await fetch(`https://teammanagerdb-7567c.firebaseio.com/ideas/${id}.json?auth=${token}`).then(res => res.json());

    this.idea = {...idea, id};
    this.isAuthor = idea.author === sessionStorage.getItem('email');
    this.hasComment = !!idea.comments;

    await this.partial('./templates/details.hbs');

    const deleteBtn = document.getElementById('delete-' + id);

    deleteBtn && deleteBtn.addEventListener('click', async () => {
        notification.loading();

        await fetch(`https://teammanagerdb-7567c.firebaseio.com/ideas/${id}.json?auth=${token}`, {method: 'DELETE'});

        notification.clearLoading();
        notification.success('Idea deleted successfully.');

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
                    comments: [...(idea.comments || []), {
                        email: sessionStorage.getItem('email'),
                        comment: comment.value
                    }]
                })
            }
        );

        this.app.refresh();
    });
}

async function profileViewHandler() {
    const email = sessionStorage.getItem('email');
    const token = sessionStorage.getItem('token');

    const ideas = await fetch(`https://teammanagerdb-7567c.firebaseio.com/ideas.json?auth=${token}`).then(res => res.json());

    const organizedIdeas = Object.values(ideas).filter(({author, location}) => author === email);

    this.email = email;
    this.numOrganizedIdeas = organizedIdeas.length;
    this.organizedIdeas = organizedIdeas;

    await this.partial('./templates/profile.hbs');
}
