package com.example.employees.controller;

import com.example.employees.model.Employee;
import com.example.employees.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin
public class EmployeeController {

    @Autowired
    private EmployeeRepository repository;

    @GetMapping
    public List<Employee> getEmployees(){
        return repository.findAll();
    }

    @PostMapping
    public Employee addEmployee(@RequestBody Employee employee){
        return repository.save(employee);
    }

}