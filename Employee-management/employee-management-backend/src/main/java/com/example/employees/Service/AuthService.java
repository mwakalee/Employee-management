package com.example.employees.service;

import com.example.employees.model.User;
import com.example.employees.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository repository;

    public User login(String username,String password){

        User user = repository.findByUsername(username);

        if(user != null && user.getPassword().equals(password)){
            return user;
        }

        return null;

    }

}