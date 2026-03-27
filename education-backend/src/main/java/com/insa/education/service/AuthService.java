package com.insa.education.service;

import com.insa.education.config.JwtUtil;
import com.insa.education.dto.request.LoginRequestDto;
import com.insa.education.dto.request.RegisterRequestDto;
import com.insa.education.dto.response.AuthResponse;
import com.insa.education.dto.response.EmployeeResponse;
import com.insa.education.entity.Employee;
import com.insa.education.exception.BadRequestException;
import com.insa.education.exception.DuplicateResourceException;
import com.insa.education.mapper.EducationMapper;
import com.insa.education.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EducationMapper mapper;

    public AuthService(EmployeeRepository employeeRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       EducationMapper mapper) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.mapper = mapper;
    }

    @Transactional
    public EmployeeResponse register(RegisterRequestDto dto) {
        if (employeeRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + dto.getEmail());
        }
        if (employeeRepository.existsByEmployeeId(dto.getEmployeeId())) {
            throw new DuplicateResourceException("Employee ID already exists: " + dto.getEmployeeId());
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
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(dto.getRole())
                .build();

        Employee saved = employeeRepository.save(employee);
        log.info("Registered new employee: {}", saved.getEmail());
        return mapper.toEmployeeResponse(saved);
    }

    public AuthResponse login(LoginRequestDto dto) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword()));

        Employee employee = employeeRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        String token = jwtUtil.generateToken(employee.getEmail(), employee.getRole().name());

        log.info("Employee logged in: {}", employee.getEmail());
        return AuthResponse.builder()
                .token(token)
                .email(employee.getEmail())
                .fullName(employee.getFirstName() + " " + employee.getLastName())
                .role(employee.getRole())
                .employeeId(employee.getId())
                .department(employee.getDepartment())
                .build();
    }
}
