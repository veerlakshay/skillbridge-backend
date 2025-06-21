package com.skillbridge.backend.service;

import java.util.List;

import com.skillbridge.backend.model.User;

public interface UserService {

    List<User> getAllUsers();

    User getUserById(Long id);
}
