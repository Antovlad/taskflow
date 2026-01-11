package ro.taskflow.scheduling;

import ro.taskflow.domain.Task;

import java.util.List;

public interface SchedulingStrategy {
    StrategyType type();
    ScheduleResult schedule(List<Task> tasks);
}
