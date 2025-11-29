package com.example.erp.controller;

import com.example.erp.model.Role;
import com.example.erp.model.User;
import com.example.erp.payload.request.LoginRequest;
import com.example.erp.payload.request.SignupRequest;
import com.example.erp.payload.response.JwtResponse;
import com.example.erp.payload.response.MessageResponse;
import com.example.erp.repository.RoleRepository;
import com.example.erp.repository.UserRepository;
import com.example.erp.security.JwtUtils;
import com.example.erp.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {
        @Autowired
        AuthenticationManager authenticationManager;

        @Autowired
        UserRepository userRepository;

        @Autowired
        RoleRepository roleRepository;

        @Autowired
        PasswordEncoder encoder;

        @Autowired
        JwtUtils jwtUtils;

        @Operation(summary = "Authenticate user", description = "Authenticate user with username and password and return JWT token")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully authenticated", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = JwtResponse.class)) }),
                        @ApiResponse(responseCode = "401", description = "Invalid credentials", content = @Content) })
        @PostMapping("/signin")
        public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                                                loginRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtUtils.generateJwtToken(authentication);

                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                List<String> roles = userDetails.getAuthorities().stream()
                                .map(item -> item.getAuthority())
                                .collect(Collectors.toList());

                return ResponseEntity.ok(new JwtResponse(jwt,
                                userDetails.getId(),
                                userDetails.getUsername(),
                                userDetails.getEmail(),
                                roles));
        }

        @Operation(summary = "Register user", description = "Register a new user with username, email, password and roles")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "User registered successfully", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = MessageResponse.class)) }),
                        @ApiResponse(responseCode = "400", description = "Username or Email already in use", content = @Content) })
        @PostMapping("/signup")
        public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
                if (userRepository.existsByUsername(signUpRequest.getUsername())) {
                        return ResponseEntity
                                        .badRequest()
                                        .body(new MessageResponse("Error: Username is already taken!"));
                }

                if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                        return ResponseEntity
                                        .badRequest()
                                        .body(new MessageResponse("Error: Email is already in use!"));
                }

                // Create new user's account
                User user = new User(null,
                                signUpRequest.getUsername(),
                                signUpRequest.getEmail(),
                                encoder.encode(signUpRequest.getPassword()),
                                new HashSet<>());

                Set<String> strRoles = signUpRequest.getRole();
                Set<Role> roles = new HashSet<>();

                if (strRoles == null) {
                        Role userRole = roleRepository.findByName("ROLE_USER")
                                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                } else {
                        strRoles.forEach(role -> {
                                switch (role) {
                                        case "admin":
                                                Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                                                                .orElseThrow(() -> new RuntimeException(
                                                                                "Error: Role is not found."));
                                                roles.add(adminRole);

                                                break;
                                        case "hr":
                                                Role modRole = roleRepository.findByName("ROLE_HR")
                                                                .orElseThrow(() -> new RuntimeException(
                                                                                "Error: Role is not found."));
                                                roles.add(modRole);

                                                break;
                                        default:
                                                Role userRole = roleRepository.findByName("ROLE_USER")
                                                                .orElseThrow(() -> new RuntimeException(
                                                                                "Error: Role is not found."));
                                                roles.add(userRole);
                                }
                        });
                }

                user.setRoles(roles);
                userRepository.save(user);

                return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        }
}
