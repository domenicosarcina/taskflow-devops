package com.taskmanager.backend.entity;

import com.taskmanager.backend.enums.Priority;
import com.taskmanager.backend.enums.Status;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity(name = "tasks")
@EntityListeners(AuditingEntityListener.class)
@AllArgsConstructor @NoArgsConstructor @Data
public class Task {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    @Size(min = 3, max = 255) @NotNull
    private String title;

    @Size(min = 3, max = 255)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    private Status status;

    @NotNull
    @Enumerated(EnumType.STRING)
    private Priority priority;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

}
