var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const apiUrl = "https://miniature-winner-rwj6q67xv773w59g-8080.app.github.dev/api/employees";
function fetchEmployees() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(apiUrl);
        const employees = yield response.json();
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
    });
}
function addEmployee() {
    return __awaiter(this, void 0, void 0, function* () {
        const nameInput = document.getElementById("name");
        const positionInput = document.getElementById("position");
        const employee = {
            name: nameInput.value,
            position: positionInput.value
        };
        yield fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(employee)
        });
        nameInput.value = "";
        positionInput.value = "";
        fetchEmployees();
    });
}
function deleteEmployee(id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch(`${apiUrl}/${id}`, {
            method: "DELETE"
        });
        fetchEmployees();
    });
}
window.onload = () => {
    fetchEmployees();
};
