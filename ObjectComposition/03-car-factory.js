function solve({model, power, color, carriage, wheelsize}) {
    const possibilities = [
        {power: 90, volume: 1800},
        {power: 120, volume: 2400},
        {power: 200, volume: 3500}
    ];

    return {
        model,
        engine: possibilities.find((p) => power <= p.power),
        carriage: {type: carriage, color},
        wheels: Array(4).fill(wheelsize % 2 === 0 ? wheelsize - 1 : wheelsize)
    }
}
