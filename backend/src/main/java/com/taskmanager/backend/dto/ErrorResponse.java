package com.taskmanager.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
public class ErrorResponse {

    private Integer status;
    private String message;
    private String error;
    private LocalDateTime timestamp;

    public ErrorResponse(Integer status, String message, String error) {
        this.status = status;
        this.message = message;
        this.error = error;
        this.timestamp = LocalDateTime.now();
    }

}
