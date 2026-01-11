package ro.taskflow.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import ro.taskflow.scheduling.StrategyType;

public record ScheduleRequest(
        @NotNull StrategyType strategy,

        // câte minute pe zi ai disponibile (ex: 480 = 8h)
        @Min(30) @Max(1440) int availableMinutesPerDay
) {}
