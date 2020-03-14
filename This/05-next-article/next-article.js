function getArticleGenerator(articles) {
    const content = document.getElementById('content');

    return (() => {
        let index = 0;

        return () => {
            if (articles[index]) {
                const article = document.createElement('article');
                article.textContent = articles[index];

                content.appendChild(article);

                return index++;
            }
        }
    })()
}
