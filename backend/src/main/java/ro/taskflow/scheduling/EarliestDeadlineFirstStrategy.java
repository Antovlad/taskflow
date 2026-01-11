package ro.taskflow.scheduling;

import org.springframework.stereotype.Component;
import ro.taskflow.domain.Task;

import java.util.*;

@Component
public class EarliestDeadlineFirstStrategy implements SchedulingStrategy {

    @Override
    public StrategyType type() {
        return StrategyType.EDF;
    }

    @Override
    public ScheduleResult schedule(List<Task> tasks) {
        List<Task> ordered = tasks.stream()
                .sorted(Comparator
                        .comparing(Task::getDeadline)
                        .thenComparing(Task::getPriority, Comparator.reverseOrder())
                        .thenComparing(Task::getEstimatedMinutes))
                .toList();

        // EDF score: putem pune 0 sau un scor simplu; util doar pentru consistență.
        Map<Long, Double> scores = new HashMap<>();
        for (Task t : ordered) scores.put(t.getId(), 0.0);

        return new ScheduleResult(ordered, scores);
    }
}
