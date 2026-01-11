package ro.taskflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.taskflow.domain.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {
}