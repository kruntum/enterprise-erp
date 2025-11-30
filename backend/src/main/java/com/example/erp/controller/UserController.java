package com.example.erp.controller;

import com.example.erp.model.User;
import com.example.erp.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "APIs for managing users")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Operation(summary = "Get all users", description = "Retrieve a list of all users. Requires CAN_VIEW_USER permission.")
    @GetMapping
    @PreAuthorize("hasAuthority('CAN_VIEW_USER')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Operation(summary = "Get user by ID", description = "Retrieve a user by their ID. Requires CAN_VIEW_USER permission.")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CAN_VIEW_USER')")
    public User getUserById(@PathVariable long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Operation(summary = "Create user", description = "Create a new user. Requires CAN_CREATE_USER permission.")
    @PostMapping
    @PreAuthorize("hasAuthority('CAN_CREATE_USER')")
    public User createUser(@RequestBody User user) {
        user.setPassword(encoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Operation(summary = "Update user", description = "Update an existing user. Requires CAN_UPDATE_USER permission.")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CAN_UPDATE_USER')")
    public User updateUser(@PathVariable long id, @RequestBody User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(encoder.encode(userDetails.getPassword()));
        }
        user.setRoles(userDetails.getRoles());

        return userRepository.save(user);
    }

    @Operation(summary = "Delete user", description = "Delete a user by ID. Requires CAN_DELETE_USER permission.")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CAN_DELETE_USER')")
    public void deleteUser(@PathVariable long id) {
        userRepository.deleteById(id);
    }
}
