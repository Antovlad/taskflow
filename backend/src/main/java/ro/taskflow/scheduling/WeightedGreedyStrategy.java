package ro.taskflow.scheduling;

import org.springframework.stereotype.Component;
import ro.taskflow.domain.Task;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Component
public class WeightedGreedyStrategy implements SchedulingStrategy {

    @Override
    public StrategyType type() {
        return StrategyType.WEIGHTED_GREEDY;
    }

    @Override
    public ScheduleResult schedule(List<Task> tasks) {
        Instant now = Instant.now();

        // Scor mai mare = mai sus în listă
        // Intuiție:
        //  - prioritate mare => scor mare
        //  - durată mică => scor mare (ca să "închizi" rapid task-uri)
        //  - deadline apropiat => boost (urgență)
        Map<Long, Double> scores = new HashMap<>();

        for (Task t : tasks) {
            double p = t.getPriority(); // 1..5
            double d = Math.max(1, t.getEstimatedMinutes());

            long minutesToDeadline = Duration.between(now, t.getDeadline()).toMinutes();
            // Dacă e deja trecut, îl facem foarte urgent.
            double urgency = minutesToDeadline <= 0 ? 10.0 : Math.min(10.0, 1440.0 / minutesToDeadline);
            // 1440/minutes: cu cât deadline-ul e mai aproape, cu atât crește (cap la 10)

            double score = (p * (1.0 + urgency)) / d;
            scores.put(t.getId(), score);
        }

        List<Task> ordered = tasks.stream()
                .sorted((a, b) -> Double.compare(scores.get(b.getId()), scores.get(a.getId())))
                .toList();

        return new ScheduleResult(ordered, scores);
    }
}
