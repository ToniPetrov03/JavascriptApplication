import {createFormEntity} from './form-helpers.js';

async function init() {
    const templates = await Promise.all([
        fetch('./templates/index.hbs').then(r => r.text()),
        fetch('./templates/header.hbs').then(r => r.text()),
        fetch('./templates/footer.hbs').then(r => r.text()),
    ]);

    const [index, header, footer] = templates.map(x => Handlebars.compile(x));

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
        this.get('#/details/:category/:id', detailsViewHandler);
        this.get('#/edit/:category/:id', editViewHandler);
        this.post('#/edit/:category/:id', () => false);

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
        const sortArticles = (articles) => Object
            .entries(articles)
            .map(([id, {title, content}]) => ({id, title, content}))
            .sort((a, b) => a.title.localeCompare(b.title));

        const jsArticles = await fetch(`https://teammanagerdb-7567c.firebaseio.com/JavaScript.json?auth=${token}`).then(res => res.json());

        this.hasJsArticle = !!jsArticles;

        if (this.hasJsArticle) {
            this.jsArticles = sortArticles(jsArticles)
        }

        const cSharpArticles = await fetch(`https://teammanagerdb-7567c.firebaseio.com/CSharp.json?auth=${token}`).then(res => res.json());

        this.hasCSharpArticle = !!cSharpArticles;

        if (this.hasCSharpArticle) {
            this.cSharpArticles = sortArticles(cSharpArticles)
        }

        const javaArticles = await fetch(`https://teammanagerdb-7567c.firebaseio.com/Java.json?auth=${token}`).then(res => res.json());

        this.hasJavaArticle = !!javaArticles;

        if (this.hasJavaArticle) {
            this.javaArticles = sortArticles(javaArticles)
        }

        const pytonArticles = await fetch(`https://teammanagerdb-7567c.firebaseio.com/Pyton.json?auth=${token}`).then(res => res.json());

        this.hasPytonArticle = !!pytonArticles;

        if (this.hasPytonArticle) {
            this.pytonArticles = sortArticles(pytonArticles)
        }

        await this.partial('./templates/home.hbs');
    } else {
        await this.partial('./templates/home.hbs');

        this.redirect(['#/login'])
    }
}

async function registerViewHandler() {
    await this.partial('./templates/registerForm.hbs');

    const formRef = document.getElementById('register-form');

    formRef.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = createFormEntity(formRef, ['email', 'password', 'repPass']);

        const {email, password, repPass} = form.getValue();

        if (password !== repPass) return;

        await firebase.auth().createUserWithEmailAndPassword(email, password);
    });
}

async function loginViewHandler() {
    await this.partial('./templates/loginForm.hbs');

    const formRef = document.getElementById('login-form');

    formRef.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = createFormEntity(formRef, ['email', 'password']);

        const {email, password} = form.getValue();

        await firebase.auth().signInWithEmailAndPassword(email, password);
    })
}

async function logoutHandler() {
    await firebase.auth().signOut();
}

async function createViewHandler() {
    await this.partial('./templates/createForm.hbs');

    const formRef = document.getElementById('create-form');

    formRef.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = createFormEntity(formRef, ['title', 'category', 'content']);

        const token = sessionStorage.getItem('token');
        const author = sessionStorage.getItem('email');
        const article = form.getValue();
        const category = article.category;

        if (!['JavaScript', 'CSharp', 'Java', 'Pyton'].includes(category)) return;

        await fetch(`https://teammanagerdb-7567c.firebaseio.com/${category}.json?auth=${token}`,
            {
                method: 'POST',
                body: JSON.stringify({
                    ...article,
                    author,
                })
            }
        ).then(res => res.json());

        this.redirect(['#/'])
    })
}

async function detailsViewHandler(req) {
    const id = req.params.id;
    const category = req.params.category;
    const token = sessionStorage.getItem('token');

    const article = await fetch(`https://teammanagerdb-7567c.firebaseio.com/${category}/${id}.json?auth=${token}`).then(res => res.json());

    this.article = {...article, id};

    this.isAuthor = article.author === sessionStorage.getItem('email');

    await this.partial('./templates/details.hbs');

    const deleteBtn = document.getElementById('delete-' + id);

    deleteBtn && deleteBtn.addEventListener('click', async () => {
        await deleteArticle(category, id, token);

        this.redirect(['#/'])
    });
}

async function deleteArticle(category, id, token) {
    await fetch(`https://teammanagerdb-7567c.firebaseio.com/${category}/${id}.json?auth=${token}`, {method: 'DELETE'});
}

async function editViewHandler(req) {
    const id = req.params.id;
    const _category = req.params.category;
    const token = sessionStorage.getItem('token');

    const article = await fetch(`https://teammanagerdb-7567c.firebaseio.com/${_category}/${id}.json?auth=${token}`).then(res => res.json());

    this.article = {...article, id};

    await this.partial('./templates/editForm.hbs');

    const formRef = document.getElementById('edit-form');
    const form = createFormEntity(formRef, ['title', 'category', 'content']);

    form.setValue(article);

    formRef.addEventListener('submit', async (e) => {
        e.preventDefault();

        const {title, category, content} = form.getValue();

        if (!['JavaScript', 'CSharp', 'Java', 'Pyton'].includes(category)) return;

        if (category !== _category) {
            await deleteArticle(_category, id, token);
        }

        await fetch(`https://teammanagerdb-7567c.firebaseio.com/${category}/${id}.json?auth=${token}`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    ...article, title, category, content
                })
            }
        ).then(res => res.json());

        this.redirect(['#/'])
    })
}