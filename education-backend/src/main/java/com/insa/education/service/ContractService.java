package com.insa.education.service;

import com.insa.education.dto.request.ContractDto;
import com.insa.education.dto.response.ContractResponse;
import com.insa.education.entity.EducationContract;
import com.insa.education.entity.EducationRequest;
import com.insa.education.entity.Employee;
import com.insa.education.enums.RequestStatus;
import com.insa.education.exception.BadRequestException;
import com.insa.education.exception.DuplicateResourceException;
import com.insa.education.exception.ResourceNotFoundException;
import com.insa.education.mapper.EducationMapper;
import com.insa.education.repository.EducationContractRepository;
import com.insa.education.repository.EducationRequestRepository;
import com.insa.education.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContractService {

    private static final Logger log = LoggerFactory.getLogger(ContractService.class);

    private final EducationContractRepository contractRepository;
    private final EducationRequestRepository requestRepository;
    private final EmployeeRepository employeeRepository;
    private final EducationMapper mapper;

    public ContractService(EducationContractRepository contractRepository,
                           EducationRequestRepository requestRepository,
                           EmployeeRepository employeeRepository,
                           EducationMapper mapper) {
        this.contractRepository = contractRepository;
        this.requestRepository = requestRepository;
        this.employeeRepository = employeeRepository;
        this.mapper = mapper;
    }

    @Transactional
    public ContractResponse create(ContractDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + dto.getEmployeeId()));

        EducationRequest request = requestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Education request not found with id: " + dto.getRequestId()));

        if (request.getStatus() != RequestStatus.APPROVED && request.getStatus() != RequestStatus.CDC_APPROVED) {
            throw new BadRequestException("Request must be APPROVED or CDC_APPROVED before creating contract");
        }

        if (contractRepository.existsByRequestId(dto.getRequestId())) {
            throw new DuplicateResourceException("Contract already exists for request: " + dto.getRequestId());
        }

        EducationContract contract = EducationContract.builder()
                .employee(employee)
                .request(request)
                .university(dto.getUniversity())
                .program(dto.getProgram())
                .studyCountry(dto.getStudyCountry())
                .studyCity(dto.getStudyCity())
                .durationYears(dto.getDurationYears())
                .studyMode(dto.getStudyMode())
                .estimatedCost(dto.getEstimatedCost())
                .contractSignedDate(dto.getContractSignedDate())
                .build();

        EducationContract saved = contractRepository.save(contract);

        request.setStatus(RequestStatus.CONTRACT_CREATED);
        requestRepository.save(request);

        log.info("Contract created: id={}, employee={}", saved.getId(), employee.getEmployeeId());
        return mapper.toContractResponse(saved);
    }

    @Transactional(readOnly = true)
    public ContractResponse getById(Long id) {
        EducationContract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with id: " + id));
        return mapper.toContractResponse(contract);
    }

    @Transactional(readOnly = true)
    public Page<ContractResponse> getAll(Pageable pageable) {
        return contractRepository.findAll(pageable).map(mapper::toContractResponse);
    }

    @Transactional(readOnly = true)
    public Page<ContractResponse> getByEmployeeId(Long employeeId, Pageable pageable) {
        return contractRepository.findByEmployeeId(employeeId, pageable).map(mapper::toContractResponse);
    }
}
