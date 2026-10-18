package com.taskmanager.backend.service.impl;

import com.taskmanager.backend.dto.LoginRequest;
import com.taskmanager.backend.dto.LoginResponse;
import com.taskmanager.backend.repository.UserRepository;
import com.taskmanager.backend.security.JwtService;
import com.taskmanager.backend.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AuthSerivceImpl implements AuthService {

    private final CustomUserDetailsService customUserDetailsService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthSerivceImpl(CustomUserDetailsService customUserDetailsService, AuthenticationManager authenticationManager, JwtService jwtService){
        this.customUserDetailsService = customUserDetailsService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Override
    public LoginResponse login(LoginRequest loginRequest) {

        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(loginRequest.getUsername());

        String token = jwtService.generateToken(userDetails);

        return new LoginResponse(token);
    }
}
