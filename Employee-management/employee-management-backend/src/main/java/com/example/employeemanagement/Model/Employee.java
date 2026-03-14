package com.example.employeemanagement.model;

public class Employee {
    private Long id;
    private String name;
    private String email;
    private String department;
    private String title;
    private String managerUsername;
    private String username;

    public Employee() {
    }

    public Employee(Long id, String name, String email, String department, String title, String managerUsername, String username) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.department = department;
        this.title = title;
        this.managerUsername = managerUsername;
        this.username = username;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getManagerUsername() { return managerUsername; }
    public void setManagerUsername(String managerUsername) { this.managerUsername = managerUsername; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}