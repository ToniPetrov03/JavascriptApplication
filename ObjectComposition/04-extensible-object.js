function solve() {
    return {
        extend: function (template) {
            Object.keys(template).forEach(key => {
                if (typeof template[key] === 'function') {
                    Object.getPrototypeOf(this)[key] = template[key];
                } else {
                    this[key] = template[key]
                }
            })
        }
    }
}
