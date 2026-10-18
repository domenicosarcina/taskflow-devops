package com.taskmanager.backend.exception;

public class TaskNotFoundException extends RuntimeException{

    public TaskNotFoundException(String message) {
        super(message);
    }

}
