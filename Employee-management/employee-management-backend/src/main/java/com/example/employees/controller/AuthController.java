package com.example.employees.controller;

import com.example.employees.model.User;
import com.example.employees.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private AuthService service;

    @PostMapping("/login")
    public User login(@RequestBody User request){

        return service.login(
                request.getUsername(),
                request.getPassword()
        );

    }

}