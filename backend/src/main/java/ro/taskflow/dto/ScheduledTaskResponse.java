package ro.taskflow.dto;

import ro.taskflow.domain.TaskStatus;

import java.time.Instant;

public record ScheduledTaskResponse(
        Long id,
        String title,
        Instant deadline,
        int estimatedMinutes,
        int priority,
        TaskStatus status,
        double score,
        String reason
) {}
