package ro.taskflow.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ro.taskflow.dto.ScheduleRequest;
import ro.taskflow.dto.ScheduleResponse;
import ro.taskflow.service.SchedulingService;
import ro.taskflow.dto.ScheduleCompareResponse;
@RestController
@RequestMapping("/api/schedule")
@CrossOrigin(origins = "http://localhost:5173")
public class SchedulingController {

    private final SchedulingService schedulingService;

    public SchedulingController(SchedulingService schedulingService) {
        this.schedulingService = schedulingService;
    }

    @PostMapping
    public ScheduleResponse schedule(@Valid @RequestBody ScheduleRequest req) {
        return schedulingService.schedule(req.strategy(), req.availableMinutesPerDay());
    }

    @PostMapping("/compare")
    public ScheduleCompareResponse compare(@Valid @RequestBody ScheduleRequest req) {
        return schedulingService.compare(req.availableMinutesPerDay());
    }
}
