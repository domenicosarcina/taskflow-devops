package com.taskmanager.backend.mappers;

import com.taskmanager.backend.dto.TaskRequest;
import com.taskmanager.backend.dto.TaskResponse;
import com.taskmanager.backend.entity.Task;

public class TaskMapper {

    public static TaskResponse mapToTaskResponse(Task task) {
        TaskResponse taskResponse = new TaskResponse();
        taskResponse.setId(task.getId());
        taskResponse.setTitle(task.getTitle());
        taskResponse.setDescription(task.getDescription());
        taskResponse.setStatus(task.getStatus());
        taskResponse.setPriority(task.getPriority());
        return taskResponse;
    }

    public static Task mapToTask(TaskRequest taskRequest) {
        Task task = new Task();
        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        task.setStatus(taskRequest.getStatus());
        task.setPriority(taskRequest.getPriority());
        return task;
    }

}
