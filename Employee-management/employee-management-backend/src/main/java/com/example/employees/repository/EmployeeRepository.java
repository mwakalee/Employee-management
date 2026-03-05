package com.example.employees.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.employees.model.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
}
