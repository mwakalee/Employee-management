const apiUrl = "https://miniature-winner-rwj6q67xv773w59g-8080.app.github.dev/api/employees";

interface Employee {
    id?: number;
    name: string;
    position: string;
}

async function fetchEmployees() {
    const response = await fetch(apiUrl);
    const employees: Employee[] = await response.json();

    const list = document.getElementById("employeeList")!;
    list.innerHTML = "";

    employees.forEach(emp => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${emp.name} - ${emp.position}
            <button onclick="deleteEmployee(${emp.id})">Delete</button>
        `;
        list.appendChild(li);
    });
}

async function addEmployee() {
    const nameInput = document.getElementById("name") as HTMLInputElement;
    const positionInput = document.getElementById("position") as HTMLInputElement;

    const employee: Employee = {
        name: nameInput.value,
        position: positionInput.value
    };

    await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee)
    });

    nameInput.value = "";
    positionInput.value = "";
    fetchEmployees();
}

async function deleteEmployee(id: number) {
    await fetch(`${apiUrl}/${id}`, {
        method: "DELETE"
    });

    fetchEmployees();
}

window.onload = () => {
    fetchEmployees();
};