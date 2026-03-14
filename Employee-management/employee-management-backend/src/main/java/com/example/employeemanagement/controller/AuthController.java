package com.example.employeemanagement.controller;

import com.example.employeemanagement.service.InMemoryDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final InMemoryDataService dataService;

    public AuthController(InMemoryDataService dataService) {
        this.dataService = dataService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "");
        String password = body.getOrDefault("password", "");

        return dataService.login(username, password)
                .map(user -> ResponseEntity.ok(Map.of(
                        "username", user.username(),
                        "fullName", user.fullName(),
                        "role", user.role().name(),
                        "customAccessLabel", user.customAccessLabel() == null ? "" : user.customAccessLabel()
                )))
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("message", "Invalid credentials")));
    }
}