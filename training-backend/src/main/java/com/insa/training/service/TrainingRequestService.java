package com.insa.training.service;

import com.insa.training.dto.TrainingRequestDto;
import com.insa.training.dto.TrainingRequestResponse;
import com.insa.training.entity.TrainingRequest;
import com.insa.training.enums.TrainingStatus;
import com.insa.training.repository.TrainingRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainingRequestService {

    private final TrainingRequestRepository repository;

    @Transactional
    public TrainingRequestResponse create(TrainingRequestDto dto) {
        TrainingRequest request = TrainingRequest.builder()
                .department(dto.getDepartment())
                .sector(dto.getSector())
                .trainingTitle(dto.getTrainingTitle())
                .estimatedCost(dto.getEstimatedCost())
                .numTrainees(dto.getNumTrainees())
                .trainingDuration(dto.getTrainingDuration())
                .trainingLocation(dto.getTrainingLocation())
                .budgetSource(dto.getBudgetSource())
                .specification(dto.getSpecification())
                .requesterName(dto.getRequesterName())
                .requesterId(dto.getRequesterId())
                .requesterEmail(dto.getRequesterEmail())
                .requesterPhone(dto.getRequesterPhone())
                .requesterGender(dto.getRequesterGender())
                .requesterPosition(dto.getRequesterPosition())
                .status(TrainingStatus.SUBMITTED)
                .build();

        return mapToResponse(repository.save(request));
    }

    @Transactional(readOnly = true)
    public List<TrainingRequestResponse> getAll() {
        return repository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TrainingRequestResponse> getByRequester(String requesterId) {
        return repository.findByRequesterId(requesterId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TrainingRequestResponse getById(Long id) {
        return repository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Training Request not found"));
    }

    @Transactional
    public TrainingRequestResponse updateStatus(Long id, TrainingStatus status, String note) {
        TrainingRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training Request not found"));
        
        request.setStatus(status);
        request.setReviewNote(note);
        
        return mapToResponse(repository.save(request));
    }

    private TrainingRequestResponse mapToResponse(TrainingRequest request) {
        return TrainingRequestResponse.builder()
                .id(request.getId())
                .department(request.getDepartment())
                .sector(request.getSector())
                .trainingTitle(request.getTrainingTitle())
                .estimatedCost(request.getEstimatedCost())
                .numTrainees(request.getNumTrainees())
                .trainingDuration(request.getTrainingDuration())
                .trainingLocation(request.getTrainingLocation())
                .budgetSource(request.getBudgetSource())
                .specification(request.getSpecification())
                .requesterName(request.getRequesterName())
                .requesterId(request.getRequesterId())
                .requesterEmail(request.getRequesterEmail())
                .requesterPhone(request.getRequesterPhone())
                .requesterGender(request.getRequesterGender())
                .requesterPosition(request.getRequesterPosition())
                .status(request.getStatus())
                .reviewNote(request.getReviewNote())
                .contractId(request.getContractId())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}
