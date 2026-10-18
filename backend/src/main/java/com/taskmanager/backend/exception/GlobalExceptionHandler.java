package com.taskmanager.backend.exception;

import com.taskmanager.backend.dto.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleTaskNotFoundException(TaskNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(404, ex.getMessage(), "Task not found");
        return ResponseEntity.status(404).body(error);
    }

}
