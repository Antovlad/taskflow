package ro.taskflow.dto;

import ro.taskflow.domain.TaskStatus;

import java.time.Instant;

public record TaskResponse(
        Long id,
        String title,
        String description,
        Instant deadline,
        int estimatedMinutes,
        int priority,
        TaskStatus status,
        Instant createdAt
) {}
