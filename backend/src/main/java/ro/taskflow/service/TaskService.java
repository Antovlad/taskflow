package ro.taskflow.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.taskflow.domain.Task;
import ro.taskflow.dto.CreateTaskRequest;
import ro.taskflow.dto.TaskResponse;
import ro.taskflow.repository.TaskRepository;
import ro.taskflow.domain.TaskStatus;
import java.util.NoSuchElementException;

import java.util.List;

@Service
public class TaskService {
    private final TaskRepository repo;

    public TaskService(TaskRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> list() {
        return repo.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public TaskResponse create(CreateTaskRequest req) {
        Task t = new Task();
        t.setTitle(req.title());
        t.setDescription(req.description());
        t.setDeadline(req.deadline());
        t.setEstimatedMinutes(req.estimatedMinutes());
        t.setPriority(req.priority());
        return toResponse(repo.save(t));
    }

    private TaskResponse toResponse(Task t) {
        return new TaskResponse(
                t.getId(),
                t.getTitle(),
                t.getDescription(),
                t.getDeadline(),
                t.getEstimatedMinutes(),
                t.getPriority(),
                t.getStatus(),
                t.getCreatedAt()
        );
    }

    @Transactional
    public TaskResponse updateStatus(Long id, TaskStatus status) {
        Task t = repo.findById(id).orElseThrow(() -> new NoSuchElementException("Task not found"));
        t.setStatus(status);
        return toResponse(repo.save(t));
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) throw new NoSuchElementException("Task not found");
        repo.deleteById(id);
    }
}
