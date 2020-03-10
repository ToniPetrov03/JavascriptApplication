function sortedList() {
    const arr = [];

    const sorting = (arr) => arr.sort((a, b) => a - b);

    const add = function (element) {
        arr.push(element);
        sorting(arr);
        this.size++;

        return arr;
    };

    const remove = function (index) {
        if (index in arr) {
            arr.splice(index, 1);
            sorting(arr);
            this.size--;

            return arr;
        }
    };

    const get = function (index) {
        if (index in arr) {
            return arr[index];
        }
    };

    return {add, remove, get, size: 0}
}
