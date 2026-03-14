package com.example.employeemanagement.model;

public record UserAccount(
        String username,
        String password,
        String fullName,
        Role role,
        String customAccessLabel,
        String managerUsername
) {
}