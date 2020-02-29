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
        let num = number

        if (num instanceof Hex) {
            num = number.value;
        }

        return new Hex(this.value + num);
    }

    minus(number) {
        let num = number

        if (num instanceof Hex) {
            num = number.value;
        }

        return new Hex(this.value - num);
    }

    parse(string) {
        return parseInt(string);
    }
}
