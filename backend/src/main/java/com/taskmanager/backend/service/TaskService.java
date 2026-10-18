package com.taskmanager.backend.service;

import com.taskmanager.backend.dto.TaskRequest;
import com.taskmanager.backend.dto.TaskResponse;
import com.taskmanager.backend.entity.Task;

import java.util.List;

public interface TaskService {

    public List<TaskResponse> getAllTasks();

    public TaskResponse getTaskById(Long id);

    public TaskResponse saveTask(TaskRequest task);

    public int deleteTask(Long id);

    public TaskResponse updateTask(TaskRequest task, Long id);

    public String getTaskStatus(Long id);

}
