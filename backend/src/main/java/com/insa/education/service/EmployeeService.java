package com.insa.education.service;

import com.insa.education.dto.request.EmployeeDto;
import com.insa.education.dto.response.EmployeeResponse;
import com.insa.education.entity.Employee;
import com.insa.education.exception.BadRequestException;
import com.insa.education.exception.ResourceNotFoundException;
import com.insa.education.mapper.EducationMapper;
import com.insa.education.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EducationMapper mapper;

    public EmployeeService(EmployeeRepository employeeRepository, EducationMapper mapper) {
        this.employeeRepository = employeeRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> findByDepartment(String department) {
        return employeeRepository.findByDepartment(department).stream()
                .map(mapper::toEmployeeResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return mapper.toEmployeeResponse(employee);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getAll(Pageable pageable) {
        return employeeRepository.findAll(pageable)
                .map(mapper::toEmployeeResponse);
    }

    @Transactional
    public EmployeeResponse create(EmployeeDto dto) {
        if (employeeRepository.existsByEmployeeId(dto.getEmployeeId())) {
            throw new BadRequestException("Employee ID already exists: " + dto.getEmployeeId());
        }
        if (employeeRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email already exists: " + dto.getEmail());
        }

        Employee employee = Employee.builder()
                .employeeId(dto.getEmployeeId())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .gender(dto.getGender())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .department(dto.getDepartment())
                .position(dto.getPosition())
                .password(dto.getPassword())
                .role(dto.getRole())
                .build();

        Employee saved = employeeRepository.save(employee);
        return mapper.toEmployeeResponse(saved);
    }

    @Transactional
    public EmployeeResponse update(Long id, EmployeeDto dto) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setGender(dto.getGender());
        employee.setPhone(dto.getPhone());
        employee.setDepartment(dto.getDepartment());
        employee.setPosition(dto.getPosition());
        employee.setRole(dto.getRole());

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            employee.setPassword(dto.getPassword());
        }

        Employee saved = employeeRepository.save(employee);
        return mapper.toEmployeeResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee not found with id: " + id);
        }
        employeeRepository.deleteById(id);
    }
}
