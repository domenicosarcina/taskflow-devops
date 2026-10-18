package com.taskmanager.backend.controller;

import com.taskmanager.backend.dto.TaskRequest;
import com.taskmanager.backend.dto.TaskResponse;
import com.taskmanager.backend.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @Operation(summary = "Get all tasks")
    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks() {
        List<TaskResponse> tasks = taskService.getAllTasks();
        return new ResponseEntity<>(tasks, HttpStatus.OK);
    }

    @Operation(summary = "Get task by id")
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable @NotNull Long id) {
        TaskResponse task = taskService.getTaskById(id);
        return new ResponseEntity<>(task, HttpStatus.OK);
    }

    @Operation(summary = "Save a new task")
    @PostMapping
    public ResponseEntity<TaskResponse> saveTask(@Valid @RequestBody TaskRequest task) {
        TaskResponse taskResponse = taskService.saveTask(task);
        return new ResponseEntity<>(taskResponse, HttpStatus.CREATED);
    }

    @Operation(summary = "Update a task")
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(@Valid @RequestBody TaskRequest task, @PathVariable @NotNull Long id) {
        TaskResponse taskResponse = taskService.updateTask(task, id);
        return new ResponseEntity<>(taskResponse, HttpStatus.OK);
    }

    @Operation(summary = "Delete a task")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTask(@PathVariable @NotNull Long id) {
        int res = taskService.deleteTask(id);
        if (res == 0) {
            return new ResponseEntity<>("Task not found", HttpStatus.NOT_FOUND);
        } else return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @Operation(summary = "Update a task status")
    @PatchMapping("/{id}/status")
    public ResponseEntity<String> updateTaskStatus(@PathVariable @NotNull Long id) {
        String status = taskService.getTaskStatus(id);
        return new ResponseEntity<>(status, HttpStatus.OK);
    }

}
