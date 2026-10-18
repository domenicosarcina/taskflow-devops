package com.taskmanager.backend.dto;

import com.taskmanager.backend.enums.Priority;
import com.taskmanager.backend.enums.Status;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class TaskResponse {

    private Long id;

    private String title;

    private String description;

    private Status status;

    private Priority priority;

}
