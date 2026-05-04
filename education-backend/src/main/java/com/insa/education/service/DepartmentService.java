package com.insa.education.service;

import com.insa.education.dto.request.DepartmentDto;
import com.insa.education.dto.response.DepartmentResponse;
import com.insa.education.entity.Department;
import com.insa.education.exception.ResourceNotFoundException;
import com.insa.education.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public List<DepartmentResponse> getAll() {
        return departmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DepartmentResponse getById(Long id) {
        return departmentRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
    }

    public DepartmentResponse create(DepartmentDto dto) {
        if (departmentRepository.findByNameIgnoreCase(dto.getName()).isPresent()) {
            throw new IllegalArgumentException("Department with this name already exists");
        }
        Department department = Department.builder()
                .name(dto.getName())
                .build();
        return mapToResponse(departmentRepository.save(department));
    }

    public DepartmentResponse update(Long id, DepartmentDto dto) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        
        if (!department.getName().equalsIgnoreCase(dto.getName()) &&
            departmentRepository.findByNameIgnoreCase(dto.getName()).isPresent()) {
            throw new IllegalArgumentException("Department with this name already exists");
        }
        
        department.setName(dto.getName());
        return mapToResponse(departmentRepository.save(department));
    }

    public void delete(Long id) {
        departmentRepository.deleteById(id);
    }

    public Department findOrCreateByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return null;
        }
        return departmentRepository.findByNameIgnoreCase(name.trim())
                .orElseGet(() -> departmentRepository.save(
                        Department.builder().name(name.trim()).build()
                ));
    }

    private DepartmentResponse mapToResponse(Department department) {
        return DepartmentResponse.builder()
                .id(department.getId())
                .name(department.getName())
                .createdAt(department.getCreatedAt())
                .build();
    }
}
