(() => {
    String.prototype.ensureStart = function (str) {
        if (this.toString().startsWith(str)) {
            return this.toString();
        }

        return str + this.toString();
    };

    String.prototype.ensureEnd = function (str) {
        if (this.toString().endsWith(str)) {
            return this.toString();
        }

        return this.toString() + str;
    };

    String.prototype.isEmpty = function () {
        return this.toString() === '';
    };

    String.prototype.truncate = function (n) {
        if (this.toString().length <= n) {
            return this.toString();
        }

        const lastIndex = this.toString().substr(0, n - 2).lastIndexOf(' ');

        if (lastIndex > -1) {
            return this.toString().substr(0, lastIndex) + '...';
        }

        return this.toString().substr(0, n - 3) + '...';
    };

    String.format = function (string, ...params) {
        return params.reduce((str, param, i) => str.replace(RegExp(`\\{${i}}`), param), string)
    }
})()
