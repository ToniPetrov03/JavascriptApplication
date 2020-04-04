export const createNotification = (notConfig) => {
    const success = (message) => {
        const container = document.querySelector(notConfig.container);
        const template = document.createElement('template');
        template.innerHTML = `<div id="successBox" class="alert alert-success" role="alert">${message}</div>`;

        const node = template.content.firstChild;
        container.appendChild(node);

        setTimeout(() => {
            node.remove();
        }, notConfig.duration);
    };

    const loading = () => {
        const toast = document.querySelector(notConfig.loadingSelector);
        toast.style.display = 'block';
    };

    const clearLoading = () => {
        const toast = document.querySelector(notConfig.loadingSelector);
        toast.style.display = 'none';
    };

    const error = (message) => {
        const container = document.querySelector(notConfig.container);
        const template = document.createElement('template');
        template.innerHTML = `<div id="errorBox" class="alert alert-danger" role="alert">${message}</div>`;

        const node = template.content.firstChild;
        container.appendChild(node);

        setTimeout(() => {
            node.remove();
        }, notConfig.duration);
    };

    return {
        success,
        loading,
        clearLoading,
        error
    };
};