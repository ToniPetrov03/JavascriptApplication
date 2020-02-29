class Company {
    constructor() {
        this.departments = {};
    }

    addEmployee(username, salary, position, department) {
        if (!(username && salary > 0 && position && department)) {
            throw new Error('Invalid input!');
        }

        if (this.departments[department]) {
            this.departments[department].push([username, salary, position]);
        } else {
            this.departments[department] = [[username, salary, position]];
        }

        return `New employee is hired. Name: ${username}. Position: ${position}`;
    }

    bestDepartment() {
        const departments = this.departments;

        const [avgSalary, dep] = Object.keys(departments).reduce((bestDep, dep) => {
            const [highestAvgSalary] = bestDep;

            const avgSalary = departments[dep].reduce((sum, [, salary]) => sum + salary, 0) / departments[dep].length;

            if (avgSalary > highestAvgSalary) {
                bestDep = [avgSalary, dep];
            }

            return bestDep;
        }, [-1, '']);

        return departments[dep]
            .sort(([n, s], [n2, s2]) => s2 - s || n.localeCompare(n2))
            .reduce((output, [username, salary, position]) => output + `\n${username} ${salary} ${position}`,
                `Best Department is: ${dep}\nAverage salary: ${avgSalary.toFixed(2)}`);
    }
}
