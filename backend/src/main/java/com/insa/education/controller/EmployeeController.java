package com.insa.education.controller;

import com.insa.education.dto.request.EmployeeDto;
import com.insa.education.dto.response.EmployeeResponse;
import com.insa.education.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/department/{department}")
    @PreAuthorize("hasAnyRole('DEPARTMENT_HEAD', 'ADMIN', 'CYBER_DEVELOPMENT_CENTER', 'HR_OFFICER')")
    public ResponseEntity<List<EmployeeResponse>> findByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(employeeService.findByDepartment(department));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_OFFICER')")
    public ResponseEntity<Page<EmployeeResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(employeeService.getAll(pageable));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeResponse> create(@Valid @RequestBody EmployeeDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeResponse> update(@PathVariable Long id, @Valid @RequestBody EmployeeDto dto) {
        return ResponseEntity.ok(employeeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_OFFICER', 'DEPARTMENT_HEAD')")
    public ResponseEntity<EmployeeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getById(id));
    }
}
