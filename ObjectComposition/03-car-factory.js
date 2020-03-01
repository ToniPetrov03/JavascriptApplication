function solve(obj) {
    const power = [90, 120, 200].reduce((prev, curr) => {
        return Math.abs(curr - obj.power) > Math.abs(prev - obj.power) ? prev : curr;
    });

    const volumes = {
        90: 1800,
        120: 2400,
        200: 3500,
    }

    const wheels = obj.wheelsize % 2 === 0 ? obj.wheelsize - 1 : obj.wheelsize;

    return {
        model: obj.model,
        engine: {
            power,
            volume: volumes[power]
        },
        carriage: {
            type: obj.carriage,
            color: obj.color
        },
        wheels: [wheels, wheels, wheels, wheels]
    }
}
