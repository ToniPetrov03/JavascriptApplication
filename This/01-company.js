class Company {
    constructor() {
        this.departments = {};
    }

    addEmployee(username, salary, position, department) {
        if (!(username && salary > 0 && position && department)) {
            throw new Error('Invalid input!');
        }

        if (this.departments[department]) {
            this.departments[department].sum += salary;
            this.departments[department].employees.push({username, position, salary});
        } else {
            this.departments[department] = {
                sum: salary,
                employees: [
                    {
                        username,
                        position,
                        salary
                    }
                ]
            };
        }

        return `New employee is hired. Name: ${username}. Position: ${position}`;
    }

    bestDepartment() {
        const [avgSalary, bestDep] = Object.keys(this.departments).reduce((bestDep, dep) => {
            const [highestAvgSalary] = bestDep;

            const avgSalary = this.departments[dep].sum / this.departments[dep].employees.length;

            if (avgSalary > highestAvgSalary) {
                bestDep = [avgSalary, dep];
            }

            return bestDep;
        }, [-1, '']);

        return this.departments[bestDep].employees
            .sort((a, b) => b.salary - a.salary || a.username.localeCompare(b.username))
            .reduce((output, {username, salary, position}) => output + `\n${username} ${salary} ${position}`,
                `Best Department is: ${bestDep}\nAverage salary: ${avgSalary.toFixed(2)}`);
    }
}
