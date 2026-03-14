var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const apiBase = window.location.protocol === "file:"
    ? "http://localhost:8080/api"
    : `${window.location.origin}/api`;
let currentUser = null;
let currentEmployees = [];
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("loginForm")) {
        initializeLoginPage();
    }
    if (document.getElementById("employeeRows")) {
        initializeDashboardPage();
    }
});
function initializeLoginPage() {
    const form = document.getElementById("loginForm");
    const errorEl = document.getElementById("loginError");
    form.addEventListener("submit", (event) => __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        errorEl.textContent = "";
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        try {
            const response = yield fetch(`${apiBase}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            if (!response.ok) {
                throw new Error("Login failed");
            }
            const user = (yield response.json());
            localStorage.setItem("emsUser", JSON.stringify(user));
            window.location.href = "dashboard.html";
        }
        catch (_a) {
            errorEl.textContent = "Could not login. Check demo credentials and backend server.";
        }
    }));
}
function initializeDashboardPage() {
    return __awaiter(this, void 0, void 0, function* () {
        const session = localStorage.getItem("emsUser");
        if (!session) {
            window.location.href = "login.html";
            return;
        }
        currentUser = JSON.parse(session);
        document.getElementById("welcomeText").textContent = `${currentUser.fullName} (${currentUser.role})`;
        document.getElementById("accessSummary").textContent = accessSummary(currentUser);
        setupFormActions();
        document.getElementById("logoutBtn").addEventListener("click", logout);
        yield loadEmployees();
    });
}
function accessSummary(user) {
    if (user.role === "ADMIN")
        return "Admin can view and edit all employee records.";
    if (user.role === "MANAGER")
        return "Manager can view only direct/indirect subordinates (read-only).";
    if (user.role === "EMPLOYEE")
        return "Employee can view and edit only their own profile record.";
    return `Custom access: ${user.customAccessLabel || "Can edit extended records."}`;
}
function setupFormActions() {
    const form = document.getElementById("employeeForm");
    const cancelBtn = document.getElementById("cancelEdit");
    form.addEventListener("submit", saveEmployee);
    cancelBtn.addEventListener("click", () => resetForm());
    const canCreate = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === "ADMIN" || (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === "CUSTOM";
    document.getElementById("editorPanel").style.display = canCreate ? "block" : "none";
}
function loadEmployees() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currentUser)
            return;
        const response = yield fetch(`${apiBase}/employees?viewerUsername=${encodeURIComponent(currentUser.username)}`);
        const payload = yield response.json();
        currentEmployees = payload.employees;
        renderStats(payload.stats);
        renderEmployees();
    });
}
function renderStats(stats) {
    const statsContainer = document.getElementById("statsCards");
    statsContainer.innerHTML = "";
    const statEntries = [
        ["Total Users", stats.totalUsers],
        ["Admins", stats.admins],
        ["Managers", stats.managers],
        ["Employees", stats.employees],
        ["Custom", stats.custom]
    ];
    for (const [label, value] of statEntries) {
        const card = document.createElement("article");
        card.className = "card";
        card.innerHTML = `<h4>${label}</h4><p>${value}</p>`;
        statsContainer.appendChild(card);
    }
}
function renderEmployees() {
    const rows = document.getElementById("employeeRows");
    rows.innerHTML = "";
    const canDelete = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === "ADMIN" || (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === "CUSTOM";
    currentEmployees.forEach((employee) => {
        const canEdit = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === "ADMIN" ||
            (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === "CUSTOM" ||
            ((currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === "EMPLOYEE" && currentUser.username === employee.username);
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${employee.name}</td>
      <td>${employee.title}</td>
      <td>${employee.department}</td>
      <td>${employee.email}</td>
      <td>${employee.managerUsername || "-"}</td>
      <td>
        <button ${canEdit ? "" : "disabled"} data-action="edit" data-id="${employee.id}">Edit</button>
        <button class="danger" ${canDelete ? "" : "disabled"} data-action="delete" data-id="${employee.id}">Delete</button>
      </td>
    `;
        rows.appendChild(tr);
    });
    rows.querySelectorAll("button[data-action='edit']").forEach((button) => {
        button.addEventListener("click", () => populateForm(Number(button.dataset.id)));
    });
    rows.querySelectorAll("button[data-action='delete']").forEach((button) => {
        button.addEventListener("click", () => deleteEmployee(Number(button.dataset.id)));
    });
}
function populateForm(id) {
    const employee = currentEmployees.find((entry) => entry.id === id);
    if (!employee)
        return;
    document.getElementById("employeeId").value = String(employee.id);
    document.getElementById("name").value = employee.name;
    document.getElementById("email").value = employee.email;
    document.getElementById("department").value = employee.department;
    document.getElementById("title").value = employee.title;
    document.getElementById("employeeUsername").value = employee.username;
    document.getElementById("managerUsername").value = employee.managerUsername || "";
}
function saveEmployee(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        if (!currentUser)
            return;
        const id = document.getElementById("employeeId").value;
        const payload = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            department: document.getElementById("department").value,
            title: document.getElementById("title").value,
            username: document.getElementById("employeeUsername").value,
            managerUsername: document.getElementById("managerUsername").value
        };
        const url = id
            ? `${apiBase}/employees/${id}?actorUsername=${encodeURIComponent(currentUser.username)}`
            : `${apiBase}/employees?actorUsername=${encodeURIComponent(currentUser.username)}`;
        const response = yield fetch(url, {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const messageEl = document.getElementById("statusMessage");
        messageEl.textContent = response.ok ? "Saved successfully." : "Action denied by access policy.";
        resetForm();
        yield loadEmployees();
    });
}
function deleteEmployee(id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currentUser)
            return;
        const response = yield fetch(`${apiBase}/employees/${id}?actorUsername=${encodeURIComponent(currentUser.username)}`, {
            method: "DELETE"
        });
        const messageEl = document.getElementById("statusMessage");
        messageEl.textContent = response.ok ? "Employee removed." : "Delete not allowed for your role.";
        yield loadEmployees();
    });
}
function resetForm() {
    document.getElementById("employeeForm").reset();
    document.getElementById("employeeId").value = "";
}
function logout() {
    localStorage.removeItem("emsUser");
    window.location.href = "login.html";
}
