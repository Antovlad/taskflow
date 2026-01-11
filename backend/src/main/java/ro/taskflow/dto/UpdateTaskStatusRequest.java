package ro.taskflow.dto;

import jakarta.validation.constraints.NotNull;
import ro.taskflow.domain.TaskStatus;

public record UpdateTaskStatusRequest(@NotNull TaskStatus status) {}
