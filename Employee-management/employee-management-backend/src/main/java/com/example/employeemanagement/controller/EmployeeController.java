package com.example.employeemanagement.controller;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.Role;
import com.example.employeemanagement.model.UserAccount;
import com.example.employeemanagement.service.InMemoryDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final InMemoryDataService dataService;

    public EmployeeController(InMemoryDataService dataService) {
        this.dataService = dataService;
    }

    @GetMapping
    public ResponseEntity<?> getEmployees(@RequestParam String viewerUsername) {
        return getViewer(viewerUsername)
                .<ResponseEntity<?>>map(viewer -> ResponseEntity.ok(Map.of(
                        "employees", dataService.getVisibleEmployees(viewer),
                        "stats", Map.of(
                                "totalUsers", dataService.countByRole(Role.ADMIN) + dataService.countByRole(Role.MANAGER)
                                        + dataService.countByRole(Role.EMPLOYEE) + dataService.countByRole(Role.CUSTOM),
                                "admins", dataService.countByRole(Role.ADMIN),
                                "managers", dataService.countByRole(Role.MANAGER),
                                "employees", dataService.countByRole(Role.EMPLOYEE),
                                "custom", dataService.countByRole(Role.CUSTOM)
                        )
                )))
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("message", "Unknown user")));
    }

    @PostMapping
    public ResponseEntity<?> createEmployee(@RequestParam String actorUsername, @RequestBody Employee employee) {
        return getViewer(actorUsername)
                .flatMap(actor -> dataService.addEmployee(employee, actor))
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(403).body(Map.of("message", "You do not have permission to add employees.")));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable long id, @RequestParam String actorUsername, @RequestBody Employee employee) {
        return getViewer(actorUsername)
                .flatMap(actor -> dataService.updateEmployee(id, employee, actor))
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(403).body(Map.of("message", "You do not have permission to update this employee.")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable long id, @RequestParam String actorUsername) {
        return getViewer(actorUsername)
                .map(actor -> dataService.deleteEmployee(id, actor)
                        ? ResponseEntity.noContent().build()
                        : ResponseEntity.status(403).body(Map.of("message", "You do not have permission to delete this employee.")))
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("message", "Unknown user")));
    }

    private Optional<UserAccount> getViewer(String username) {
        return dataService.findUser(username);
    }
}