package com.taskmanager.backend.service;

import com.taskmanager.backend.dto.LoginRequest;
import com.taskmanager.backend.dto.LoginResponse;

public interface AuthService {

    public LoginResponse login(LoginRequest loginRequest);

}
