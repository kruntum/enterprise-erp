package com.example.erp.controller;

import com.example.erp.model.Role;
import com.example.erp.repository.PermissionRepository;
import com.example.erp.repository.RoleRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @Autowired
    PermissionRepository permissionRepository;

    @Operation(summary = "Get all roles", description = "Retrieve a list of all roles. Requires CAN_VIEW_ROLE permission or ADMIN role.")
    @GetMapping
    @PreAuthorize("hasAuthority('CAN_VIEW_ROLE') or hasRole('ADMIN')")
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Operation(summary = "Get role by ID", description = "Retrieve a role by ID.")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CAN_VIEW_ROLE') or hasRole('ADMIN')")
    public Role getRoleById(@PathVariable long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
    }

    @Operation(summary = "Create role", description = "Create a new role.")
    @PostMapping
    @PreAuthorize("hasAuthority('CAN_CREATE_ROLE') or hasRole('ADMIN')")
    public Role createRole(@RequestBody Role role) {
        // Ensure role name starts with ROLE_ prefix
        if (!role.getName().startsWith("ROLE_")) {
            role.setName("ROLE_" + role.getName());
        }
        return roleRepository.save(role);
    }

    @Operation(summary = "Update role", description = "Update an existing role.")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CAN_UPDATE_ROLE') or hasRole('ADMIN')")
    public Role updateRole(@PathVariable long id, @RequestBody Role roleDetails) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        String newName = roleDetails.getName();
        if (!newName.startsWith("ROLE_")) {
            newName = "ROLE_" + newName;
        }
        role.setName(newName);
        role.setDescription(roleDetails.getDescription());
        role.setPermissions(roleDetails.getPermissions());

        return roleRepository.save(role);
    }

    @Operation(summary = "Delete role", description = "Delete a role by ID.")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CAN_DELETE_ROLE') or hasRole('ADMIN')")
    public void deleteRole(@PathVariable long id) {
        roleRepository.deleteById(id);
    }

}
