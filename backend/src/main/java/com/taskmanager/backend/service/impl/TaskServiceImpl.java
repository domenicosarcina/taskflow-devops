package com.taskmanager.backend.service.impl;

import com.taskmanager.backend.dto.TaskRequest;
import com.taskmanager.backend.dto.TaskResponse;
import com.taskmanager.backend.entity.Task;
import com.taskmanager.backend.exception.TaskNotFoundException;
import com.taskmanager.backend.mappers.TaskMapper;
import com.taskmanager.backend.repository.TaskRepository;
import com.taskmanager.backend.service.TaskService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;

    public TaskServiceImpl(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    public List<TaskResponse> getAllTasks() {
        List<TaskResponse> tasks = taskRepository.findAll().stream().map(TaskMapper::mapToTaskResponse).toList();
        return tasks;
    }

    @Override
    public TaskResponse getTaskById(Long id) {
        TaskResponse task = taskRepository.findById(id).map(TaskMapper::mapToTaskResponse).orElseThrow(() -> new TaskNotFoundException("Task not found by id: " + id));
        return task;
    }

    @Override
    public TaskResponse saveTask(TaskRequest task) {
        Task taskEntity = TaskMapper.mapToTask(task);
        Task taskSaved = taskRepository.save(taskEntity);
        TaskResponse taskResponse = TaskMapper.mapToTaskResponse(taskSaved);
        return taskResponse;
    }

    @Override
    public int deleteTask(Long id) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException("Task not found by id: " + id));
        taskRepository.delete(task);
        return 1;
    }

    @Override
    public TaskResponse updateTask(TaskRequest task, Long id) {
        Task taskEntity = TaskMapper.mapToTask(task);
        taskEntity.setId(id);
        Task taskFounded = taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException("Task not found by id: " + id));
        Task taskUpdated = taskRepository.save(taskEntity);
        TaskResponse taskResponse = TaskMapper.mapToTaskResponse(taskUpdated);
        return taskResponse;
    }

    @Override
    public String getTaskStatus(Long id) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException("Task not found by id: " + id));
        String status = task.getStatus().toString();
        return status;
    }
}
