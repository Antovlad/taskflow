package ro.taskflow.scheduling;

import ro.taskflow.domain.Task;

import java.util.List;
import java.util.Map;

public record ScheduleResult(
        List<Task> ordered,
        Map<Long, Double> scores // id -> score (pentru UI/explicații)
) {}
