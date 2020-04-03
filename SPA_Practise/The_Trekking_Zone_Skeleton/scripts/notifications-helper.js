export const createNotification = (notConfig) => {
    const success = (message) => {
        const toast = document.querySelector(notConfig.successSelector);
        toast.textContent = message;
        toast.style.display = 'block';

        setTimeout(() => {
            console.log('here')
            toast.style.display = 'none';
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
        const toast = document.querySelector(notConfig.errorSelector);
        toast.textContent = message;
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, notConfig.duration);
    };

    return {
        success,
        loading,
        clearLoading,
        error
    };
};
