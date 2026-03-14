package com.example.employeemanagement.service;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.Role;
import com.example.employeemanagement.model.UserAccount;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class InMemoryDataService {

    private final Map<String, UserAccount> users = new HashMap<>();
    private final Map<Long, Employee> employees = new HashMap<>();
    private final AtomicLong nextId = new AtomicLong(7);

    public InMemoryDataService() {
        seedUsers();
        seedEmployees();
    }

    public Optional<UserAccount> login(String username, String password) {
        UserAccount user = users.get(username);
        if (user != null && user.password().equals(password)) {
            return Optional.of(user);
        }
        return Optional.empty();
    }

    public Optional<UserAccount> findUser(String username) {
        return Optional.ofNullable(users.get(username));
    }

    public List<Employee> getVisibleEmployees(UserAccount viewer) {
        return switch (viewer.role()) {
            case ADMIN, CUSTOM -> sort(employees.values().stream().toList());
            case EMPLOYEE -> sort(employees.values().stream()
                    .filter(employee -> employee.getUsername().equals(viewer.username()))
                    .toList());
            case MANAGER -> {
                Set<String> managedUsers = findAllManagedUsernames(viewer.username());
                yield sort(employees.values().stream()
                        .filter(employee -> managedUsers.contains(employee.getUsername()))
                        .toList());
            }
        };
    }

    public Optional<Employee> addEmployee(Employee employee, UserAccount actor) {
        if (actor.role() != Role.ADMIN && actor.role() != Role.CUSTOM) {
            return Optional.empty();
        }
        long id = nextId.getAndIncrement();
        employee.setId(id);
        employees.put(id, employee);
        return Optional.of(employee);
    }

    public Optional<Employee> updateEmployee(long id, Employee updated, UserAccount actor) {
        Employee existing = employees.get(id);
        if (existing == null) {
            return Optional.empty();
        }

        boolean canEdit = actor.role() == Role.ADMIN
                || actor.role() == Role.CUSTOM
                || (actor.role() == Role.EMPLOYEE && existing.getUsername().equals(actor.username()));
        if (!canEdit) {
            return Optional.empty();
        }

        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        existing.setDepartment(updated.getDepartment());
        existing.setTitle(updated.getTitle());
        existing.setManagerUsername(updated.getManagerUsername());
        existing.setUsername(updated.getUsername());
        return Optional.of(existing);
    }

    public boolean deleteEmployee(long id, UserAccount actor) {
        if (actor.role() != Role.ADMIN && actor.role() != Role.CUSTOM) {
            return false;
        }
        return employees.remove(id) != null;
    }

    public long countByRole(Role role) {
        return users.values().stream().filter(user -> user.role() == role).count();
    }

    private List<Employee> sort(List<Employee> employeeList) {
        return new ArrayList<>(employeeList).stream()
                .sorted(Comparator.comparing(Employee::getName))
                .toList();
    }

    private Set<String> findAllManagedUsernames(String managerUsername) {
        Set<String> result = new HashSet<>();
        Set<String> frontier = new HashSet<>();
        frontier.add(managerUsername);

        while (!frontier.isEmpty()) {
            Set<String> nextFrontier = new HashSet<>();
            for (String currentManager : frontier) {
                users.values().stream()
                        .filter(user -> currentManager.equals(user.managerUsername()))
                        .forEach(user -> {
                            if (result.add(user.username())) {
                                nextFrontier.add(user.username());
                            }
                        });
            }
            frontier = nextFrontier;
        }
        return result;
    }

    private void seedUsers() {
        users.put("admin", new UserAccount("admin", "admin123", "System Owner", Role.ADMIN, null, null));
        users.put("sarah.manager", new UserAccount("sarah.manager", "manager123", "Sarah Manager", Role.MANAGER, null, "admin"));
        users.put("alex.employee", new UserAccount("alex.employee", "employee123", "Alex Employee", Role.EMPLOYEE, null, "sarah.manager"));
        users.put("nina.employee", new UserAccount("nina.employee", "employee123", "Nina Employee", Role.EMPLOYEE, null, "sarah.manager"));
        users.put("liam.employee", new UserAccount("liam.employee", "employee123", "Liam Employee", Role.EMPLOYEE, null, "alex.employee"));
        users.put("it.specialist", new UserAccount("it.specialist", "custom123", "IT Specialist", Role.CUSTOM, "IT + Recruiter Access", "admin"));
    }

    private void seedEmployees() {
        employees.put(1L, new Employee(1L, "System Owner", "admin@company.com", "Leadership", "Admin", null, "admin"));
        employees.put(2L, new Employee(2L, "Sarah Manager", "sarah@company.com", "Engineering", "Manager", "admin", "sarah.manager"));
        employees.put(3L, new Employee(3L, "Alex Employee", "alex@company.com", "Engineering", "Software Engineer", "sarah.manager", "alex.employee"));
        employees.put(4L, new Employee(4L, "Nina Employee", "nina@company.com", "Engineering", "QA Engineer", "sarah.manager", "nina.employee"));
        employees.put(5L, new Employee(5L, "Liam Employee", "liam@company.com", "Engineering", "Junior Developer", "alex.employee", "liam.employee"));
        employees.put(6L, new Employee(6L, "IT Specialist", "itspecialist@company.com", "Operations", "IT Specialist", "admin", "it.specialist"));
    }
}