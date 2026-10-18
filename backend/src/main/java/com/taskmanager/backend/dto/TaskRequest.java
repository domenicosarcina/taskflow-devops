package com.taskmanager.backend.dto;

import com.taskmanager.backend.enums.Priority;
import com.taskmanager.backend.enums.Status;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor @NoArgsConstructor @Data
public class TaskRequest {

    @Size(min = 3, max = 255) @NotNull
    private String title;

    @Size(min = 3, max = 255)
    private String description;

    @NotNull
    private Status status;

    @NotNull
    private Priority priority;

}
