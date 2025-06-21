package com.skillbridge.backend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.skillbridge.backend.model.User;
import com.skillbridge.backend.repository.UserRepository;
import com.skillbridge.backend.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
}
