package ro.taskflow.dto;

public record ScheduleCompareResponse(
        ScheduleResponse edf,
        ScheduleResponse weightedGreedy
) {}
