package com.insa.education.service;

import com.insa.education.dto.request.EducationRequestDto;
import com.insa.education.dto.response.EducationRequestResponse;
import com.insa.education.entity.EducationRequest;
import com.insa.education.entity.Employee;
import com.insa.education.enums.RequestStatus;
import com.insa.education.exception.BadRequestException;
import com.insa.education.exception.ResourceNotFoundException;
import com.insa.education.mapper.EducationMapper;
import com.insa.education.repository.EducationRequestRepository;
import com.insa.education.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EducationRequestService {

    private static final Logger log = LoggerFactory.getLogger(EducationRequestService.class);

    private final EducationRequestRepository requestRepository;
    private final EmployeeRepository employeeRepository;
    private final EducationMapper mapper;

    public EducationRequestService(EducationRequestRepository requestRepository,
                                   EmployeeRepository employeeRepository,
                                   EducationMapper mapper) {
        this.requestRepository = requestRepository;
        this.employeeRepository = employeeRepository;
        this.mapper = mapper;
    }

    @Transactional
    public EducationRequestResponse create(EducationRequestDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + dto.getEmployeeId()));

        EducationRequest request = EducationRequest.builder()
                .employee(employee)
                .requestedField(dto.getRequestedField())
                .requestedLevel(dto.getRequestedLevel())
                .university(dto.getUniversity())
                .country(dto.getCountry())
                .studyMode(dto.getStudyMode())
                .description(dto.getDescription())
                .status(RequestStatus.PENDING)
                .build();

        EducationRequest saved = requestRepository.save(request);
        log.info("Education request created: id={}, employee={}", saved.getId(), employee.getEmployeeId());
        return mapper.toEducationRequestResponse(saved);
    }

    @Transactional(readOnly = true)
    public EducationRequestResponse getById(Long id) {
        EducationRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Education request not found with id: " + id));
        return mapper.toEducationRequestResponse(request);
    }

    @Transactional(readOnly = true)
    public Page<EducationRequestResponse> getAll(Pageable pageable) {
        return requestRepository.findAll(pageable).map(mapper::toEducationRequestResponse);
    }

    @Transactional(readOnly = true)
    public Page<EducationRequestResponse> getByEmployeeId(Long employeeId, Pageable pageable) {
        return requestRepository.findByEmployeeId(employeeId, pageable).map(mapper::toEducationRequestResponse);
    }

    @Transactional(readOnly = true)
    public Page<EducationRequestResponse> getByStatus(RequestStatus status, Pageable pageable) {
        return requestRepository.findByStatus(status, pageable).map(mapper::toEducationRequestResponse);
    }

    @Transactional
    public EducationRequestResponse update(Long id, EducationRequestDto dto) {
        EducationRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Education request not found with id: " + id));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Cannot edit request that is not in PENDING status");
        }

        request.setRequestedField(dto.getRequestedField());
        request.setRequestedLevel(dto.getRequestedLevel());
        request.setUniversity(dto.getUniversity());
        request.setCountry(dto.getCountry());
        request.setStudyMode(dto.getStudyMode());
        request.setDescription(dto.getDescription());

        EducationRequest saved = requestRepository.save(request);
        log.info("Education request updated: id={}", saved.getId());
        return mapper.toEducationRequestResponse(saved);
    }
}
