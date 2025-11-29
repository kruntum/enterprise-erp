package com.example.erp.controller;

import com.example.erp.model.Role;
import com.example.erp.repository.RoleRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/roles")
@Tag(name = "Role Management", description = "APIs for managing roles")
@SecurityRequirement(name = "Bearer Authentication")
public class RoleController {

    @Autowired
    RoleRepository roleRepository;

    @Operation(summary = "Get all roles", description = "Retrieve a list of all available roles.")
    @GetMapping
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
}
