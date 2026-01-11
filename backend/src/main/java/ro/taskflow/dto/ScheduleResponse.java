package ro.taskflow.dto;

import java.util.List;

public record ScheduleResponse(
        String strategy,
        int availableMinutesPerDay,
        int totalEstimatedMinutes,
        boolean overloaded,
        double onTimeRate,          // 0..1
        double averageTardinessMin, // minute întârziere medie (simulare)
        List<ScheduledTaskResponse> orderedTasks
) {}
