package ro.taskflow.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.taskflow.domain.Task;
import ro.taskflow.domain.TaskStatus;
import ro.taskflow.dto.ScheduleCompareResponse;
import ro.taskflow.dto.ScheduleResponse;
import ro.taskflow.dto.ScheduledTaskResponse;
import ro.taskflow.repository.TaskRepository;
import ro.taskflow.scheduling.ScheduleResult;
import ro.taskflow.scheduling.SchedulingStrategy;
import ro.taskflow.scheduling.StrategyType;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SchedulingService {

    private final TaskRepository taskRepo;
    private final Map<StrategyType, SchedulingStrategy> strategies;

    public SchedulingService(TaskRepository taskRepo, List<SchedulingStrategy> strategyList) {
        this.taskRepo = taskRepo;
        this.strategies = strategyList.stream().collect(Collectors.toMap(
                SchedulingStrategy::type,
                s -> s
        ));
    }

    @Transactional(readOnly = true)
    public ScheduleResponse schedule(StrategyType strategyType, int availableMinutesPerDay) {
        // Luăm doar task-urile ne-finishuite (pentru schedule)
        List<Task> tasks = taskRepo.findAll().stream()
                .filter(t -> t.getStatus() != TaskStatus.DONE)
                .toList();

        SchedulingStrategy strategy = strategies.get(strategyType);
        if (strategy == null) {
            throw new IllegalArgumentException("Unknown strategy: " + strategyType);
        }

        ScheduleResult result = strategy.schedule(tasks);

        int total = result.ordered().stream().mapToInt(Task::getEstimatedMinutes).sum();
        boolean overloaded = total > availableMinutesPerDay;

        // Simulare: începi acum și execuți task-urile în ordinea rezultată.
        Instant current = Instant.now();
        int onTimeCount = 0;
        long totalTardiness = 0;

        for (Task t : result.ordered()) {
            current = current.plusSeconds((long) t.getEstimatedMinutes() * 60L);
            long tardinessMin = Math.max(
                    0,
                    (current.getEpochSecond() - t.getDeadline().getEpochSecond()) / 60
            );

            if (tardinessMin == 0) onTimeCount++;
            totalTardiness += tardinessMin;
        }

        double onTimeRate = result.ordered().isEmpty()
                ? 1.0
                : (double) onTimeCount / result.ordered().size();

        double avgTardiness = result.ordered().isEmpty()
                ? 0.0
                : (double) totalTardiness / result.ordered().size();

        List<ScheduledTaskResponse> orderedDtos = result.ordered().stream()
                .map(t -> {
                    double sc = result.scores().getOrDefault(t.getId(), 0.0);
                    return new ScheduledTaskResponse(
                            t.getId(),
                            t.getTitle(),
                            t.getDeadline(),
                            t.getEstimatedMinutes(),
                            t.getPriority(),
                            t.getStatus(),
                            sc,
                            buildReason(t, sc)
                    );
                })
                .toList();

        return new ScheduleResponse(
                strategyType.name(),
                availableMinutesPerDay,
                total,
                overloaded,
                onTimeRate,
                avgTardiness,
                orderedDtos
        );
    }

    @Transactional(readOnly = true)
    public ScheduleCompareResponse compare(int availableMinutesPerDay) {
        ScheduleResponse edf = schedule(StrategyType.EDF, availableMinutesPerDay);
        ScheduleResponse greedy = schedule(StrategyType.WEIGHTED_GREEDY, availableMinutesPerDay);
        return new ScheduleCompareResponse(edf, greedy);
    }

    private String buildReason(Task t, double score) {
        long minutesToDeadline =
                (t.getDeadline().getEpochSecond() - Instant.now().getEpochSecond()) / 60;

        if (minutesToDeadline <= 0) return "Overdue deadline";
        if (minutesToDeadline <= 60) return "Deadline very close (<= 1h)";
        if (t.getPriority() >= 4) return "High priority";
        if (t.getEstimatedMinutes() <= 30) return "Short task";
        if (score > 0.0) return "High weighted score";
        return "Normal";
    }
}
