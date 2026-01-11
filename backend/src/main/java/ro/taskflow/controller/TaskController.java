package ro.taskflow.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ro.taskflow.dto.CreateTaskRequest;
import ro.taskflow.dto.TaskResponse;
import ro.taskflow.service.TaskService;
import ro.taskflow.dto.UpdateTaskStatusRequest;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @GetMapping
    public List<TaskResponse> list() {
        return service.list();
    }

    @PostMapping
    public TaskResponse create(@Valid @RequestBody CreateTaskRequest req) {
        return service.create(req);
    }

    @PatchMapping("/{id}/status")
    public TaskResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateTaskStatusRequest req) {
        return service.updateStatus(id, req.status());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
