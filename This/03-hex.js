class Hex {
    constructor(value) {
        this.value = value;
    }

    valueOf() {
        return this.value;
    }

    toString() {
        return '0x' + this.value.toString(16).toUpperCase();
    }

    plus(number) {
        const num = number instanceof Hex ? number.value : number;

        return new Hex(this.value + num);
    }

    minus(number) {
        const num = number instanceof Hex ? number.value : number;

        return new Hex(this.value - num);
    }

    parse(string) {
        return parseInt(string);
    }
}
