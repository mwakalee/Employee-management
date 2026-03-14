const apiBase = window.location.protocol === "file:"
  ? "http://localhost:8080/api"
  : `${window.location.origin}/api`;

interface SessionUser {
  username: string;
  fullName: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE" | "CUSTOM";
  customAccessLabel: string;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  title: string;
  managerUsername: string;
  username: string;
}

let currentUser: SessionUser | null = null;
let currentEmployees: Employee[] = [];

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("loginForm")) {
    initializeLoginPage();
  }

  if (document.getElementById("employeeRows")) {
    initializeDashboardPage();
  }
});

function initializeLoginPage() {
  const form = document.getElementById("loginForm") as HTMLFormElement;
  const errorEl = document.getElementById("loginError") as HTMLParagraphElement;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorEl.textContent = "";

    const username = (document.getElementById("username") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;

    try {
      const response = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const user = (await response.json()) as SessionUser;
      localStorage.setItem("emsUser", JSON.stringify(user));
      window.location.href = "dashboard.html";
    } catch {
      errorEl.textContent = "Could not login. Check demo credentials and backend server.";
    }
  });
}

async function initializeDashboardPage() {
  const session = localStorage.getItem("emsUser");
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  currentUser = JSON.parse(session) as SessionUser;
  (document.getElementById("welcomeText") as HTMLElement).textContent = `${currentUser.fullName} (${currentUser.role})`;
  (document.getElementById("accessSummary") as HTMLElement).textContent = accessSummary(currentUser);

  setupFormActions();
  (document.getElementById("logoutBtn") as HTMLButtonElement).addEventListener("click", logout);

  await loadEmployees();
}

function accessSummary(user: SessionUser): string {
  if (user.role === "ADMIN") return "Admin can view and edit all employee records.";
  if (user.role === "MANAGER") return "Manager can view only direct/indirect subordinates (read-only).";
  if (user.role === "EMPLOYEE") return "Employee can view and edit only their own profile record.";
  return `Custom access: ${user.customAccessLabel || "Can edit extended records."}`;
}

function setupFormActions() {
  const form = document.getElementById("employeeForm") as HTMLFormElement;
  const cancelBtn = document.getElementById("cancelEdit") as HTMLButtonElement;

  form.addEventListener("submit", saveEmployee);
  cancelBtn.addEventListener("click", () => resetForm());

  const canCreate = currentUser?.role === "ADMIN" || currentUser?.role === "CUSTOM";
  (document.getElementById("editorPanel") as HTMLElement).style.display = canCreate ? "block" : "none";
}

async function loadEmployees() {
  if (!currentUser) return;

  const response = await fetch(`${apiBase}/employees?viewerUsername=${encodeURIComponent(currentUser.username)}`);
  const payload = await response.json();
  currentEmployees = payload.employees;

  renderStats(payload.stats);
  renderEmployees();
}

function renderStats(stats: Record<string, number>) {
  const statsContainer = document.getElementById("statsCards") as HTMLElement;
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
  const rows = document.getElementById("employeeRows") as HTMLElement;
  rows.innerHTML = "";

  const canDelete = currentUser?.role === "ADMIN" || currentUser?.role === "CUSTOM";

  currentEmployees.forEach((employee) => {
    const canEdit =
      currentUser?.role === "ADMIN" ||
      currentUser?.role === "CUSTOM" ||
      (currentUser?.role === "EMPLOYEE" && currentUser.username === employee.username);

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
    button.addEventListener("click", () => populateForm(Number((button as HTMLButtonElement).dataset.id)));
  });

  rows.querySelectorAll("button[data-action='delete']").forEach((button) => {
    button.addEventListener("click", () => deleteEmployee(Number((button as HTMLButtonElement).dataset.id)));
  });
}

function populateForm(id: number) {
  const employee = currentEmployees.find((entry) => entry.id === id);
  if (!employee) return;

  (document.getElementById("employeeId") as HTMLInputElement).value = String(employee.id);
  (document.getElementById("name") as HTMLInputElement).value = employee.name;
  (document.getElementById("email") as HTMLInputElement).value = employee.email;
  (document.getElementById("department") as HTMLInputElement).value = employee.department;
  (document.getElementById("title") as HTMLInputElement).value = employee.title;
  (document.getElementById("employeeUsername") as HTMLInputElement).value = employee.username;
  (document.getElementById("managerUsername") as HTMLInputElement).value = employee.managerUsername || "";
}

async function saveEmployee(event: Event) {
  event.preventDefault();
  if (!currentUser) return;

  const id = (document.getElementById("employeeId") as HTMLInputElement).value;
  const payload = {
    name: (document.getElementById("name") as HTMLInputElement).value,
    email: (document.getElementById("email") as HTMLInputElement).value,
    department: (document.getElementById("department") as HTMLInputElement).value,
    title: (document.getElementById("title") as HTMLInputElement).value,
    username: (document.getElementById("employeeUsername") as HTMLInputElement).value,
    managerUsername: (document.getElementById("managerUsername") as HTMLInputElement).value
  };

  const url = id
    ? `${apiBase}/employees/${id}?actorUsername=${encodeURIComponent(currentUser.username)}`
    : `${apiBase}/employees?actorUsername=${encodeURIComponent(currentUser.username)}`;

  const response = await fetch(url, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const messageEl = document.getElementById("statusMessage") as HTMLElement;
  messageEl.textContent = response.ok ? "Saved successfully." : "Action denied by access policy.";

  resetForm();
  await loadEmployees();
}

async function deleteEmployee(id: number) {
  if (!currentUser) return;

  const response = await fetch(`${apiBase}/employees/${id}?actorUsername=${encodeURIComponent(currentUser.username)}`, {
    method: "DELETE"
  });

  const messageEl = document.getElementById("statusMessage") as HTMLElement;
  messageEl.textContent = response.ok ? "Employee removed." : "Delete not allowed for your role.";
  await loadEmployees();
}

function resetForm() {
  (document.getElementById("employeeForm") as HTMLFormElement).reset();
  (document.getElementById("employeeId") as HTMLInputElement).value = "";
}

function logout() {
  localStorage.removeItem("emsUser");
  window.location.href = "login.html";
}