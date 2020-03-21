describe('test cases for Console class', function () {
    it('should have method writeLine', () => {
        assert.isFunction(Console.writeLine);
    });

    describe('tests with one argument passed', function () {
        it('should return the input string', () => {
            assert.equal(Console.writeLine('test'), 'test');
        });

        it('should return undefined on non-string argument', () => {
            assert.isUndefined(Console.writeLine(123));
        });

        it('should throw error оn empty input', () => {
            assert.throws(() => Console.writeLine(), TypeError);
        });

        it('should return the input object as JSON', () => {
            const obj = {'name': 'Stamat'};

            assert.equal(Console.writeLine(obj), JSON.stringify(obj));
        });
    });

    describe('tests with multiply arguments', function () {
        it('should trow TypeError on non-string first argument', () => {
            assert.throws(() => Console.writeLine(123, 'test'), TypeError)
        });

        it('should trow RangeError on less than expected placeholder parameters', () => {
            assert.throws(() => Console.writeLine('Test {0}, {1} {2}', 'first', 'second'), RangeError);
        });

        it('should trow RangeError on more than expected placeholder parameters', () => {
            assert.throws(() => Console.writeLine('Test {0}, {1} {2}', 'first', 'second', 'third', 'fourth'), RangeError);
        });

        it('should trow RangeError on negative placeholder index', () => {
            assert.throws(() => Console.writeLine('Test {-5}, {1} {2}', 'first', 'second', 'third'), RangeError);
        });

        it('should trow RangeError on out-of-range placeholder index', () => {
            assert.throws(() => Console.writeLine('Test {0}, {1} {20}', 'first', 'second', 'third'), RangeError);
        });

        it('should trow RangeError on out-of-range placeholder index', () => {
            assert.throws(() => Console.writeLine('Test {20}', 'first'), RangeError);
        });

        it('should replace correctly all placeholders', () => {
            assert.equal(Console.writeLine('Test {0}, {1} {2}', 'first', 'second', 'third'), 'Test first, second third');
        });

        it('should replace correctly all placeholders on mixed placeholder numbers', () => {
            assert.equal(Console.writeLine('Test {1}, {0} {2}', 'first', 'second', 'third'), 'Test second, first third');
        });
    });
});
