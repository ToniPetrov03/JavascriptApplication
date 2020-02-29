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
        switch (typeof number) {
            case "number": return '0x' + (this.value + number).toString(16).toUpperCase();
            case "object": return '0x' + (this.value + number.value).toString(16).toUpperCase();
        }
    }

    minus(number) {
        switch (typeof number) {
            case "number": return '0x' + (this.value - number).toString(16).toUpperCase();
            case "object": return '0x' + (this.value - number.value).toString(16).toUpperCase();
        }
    }

    parse(string) {
        return parseInt(string, 16);
    }
}
