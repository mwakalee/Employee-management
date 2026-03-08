"use strict";
const apiUrl = "https://miniature-winner-rwj6q67xv773w59g-8080.app.github.dev/api/employees";
async function fetchEmployees() {
    const response = await fetch(apiUrl);
    const employees = await response.json();
    const list = document.getElementById("employeeList");
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
    const nameInput = document.getElementById("name");
    const positionInput = document.getElementById("position");
    const employee = {
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
async function deleteEmployee(id) {
    await fetch(`${apiUrl}/${id}`, {
        method: "DELETE"
    });
    fetchEmployees();
}
fetchEmployees();
