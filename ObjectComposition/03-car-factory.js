function solve(obj) {
    const closestPower = [90, 120, 200].reduce((prev, curr) => {
        return Math.abs(curr - obj.power) > Math.abs(prev - obj.power) ? prev : curr;
    });

    let volume;
    let power;

    switch (closestPower) {
        case 90:
            power = 90;
            volume = 1800;
            break;
        case 120:
            power = 120;
            volume = 2400;
            break;
        case 200:
            power = 200;
            volume = 3500;
            break;
    }

    const wheels = obj.wheelsize % 2 === 0 ? obj.wheelsize - 1 : obj.wheelsize;

    return {
        model: obj.model,
        engine: {
            power,
            volume
        },
        carriage: {
            type: obj.carriage,
            color: obj.color
        },
        wheels: [wheels, wheels, wheels, wheels]
    }
}
