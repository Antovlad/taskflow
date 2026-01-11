package ro.taskflow.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record CreateTaskRequest(
        @NotBlank String title,
        String description,
        @NotNull Instant deadline,
        @Min(1) int estimatedMinutes,
        @Min(1) @Max(5) int priority
) {}
