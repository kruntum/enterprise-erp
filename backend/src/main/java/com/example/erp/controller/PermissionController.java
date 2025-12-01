package com.example.erp.controller;

import com.example.erp.model.Permission;
import com.example.erp.repository.PermissionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/permissions")
@Tag(name = "Permission Management", description = "APIs for managing permissions")
@SecurityRequirement(name = "Bearer Authentication")
public class PermissionController {

    @Autowired
    PermissionRepository permissionRepository;

    @Operation(summary = "Get all permissions", description = "Retrieve a list of all permissions.")
    @GetMapping
    @PreAuthorize("hasAuthority('CAN_VIEW_PERMISSION') or hasRole('ADMIN')")
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    @Operation(summary = "Get permission by ID", description = "Retrieve a permission by ID.")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CAN_VIEW_PERMISSION') or hasRole('ADMIN')")
    public Permission getPermissionById(@PathVariable long id) {
        return permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission not found"));
    }

    @Operation(summary = "Create permission", description = "Create a new permission.")
    @PostMapping
    @PreAuthorize("hasAuthority('CAN_CREATE_PERMISSION') or hasRole('ADMIN')")
    public Permission createPermission(@RequestBody Permission permission) {
        return permissionRepository.save(Objects.requireNonNull(permission));
    }

    @Operation(summary = "Update permission", description = "Update an existing permission.")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CAN_UPDATE_PERMISSION') or hasRole('ADMIN')")
    public Permission updatePermission(@PathVariable long id, @RequestBody Permission permissionDetails) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission not found"));

        permission.setName(permissionDetails.getName());
        permission.setDescription(permissionDetails.getDescription());

        return permissionRepository.save(permission);
    }

    @Operation(summary = "Delete permission", description = "Delete a permission by ID.")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CAN_DELETE_PERMISSION') or hasRole('ADMIN')")
    public void deletePermission(@PathVariable long id) {
        permissionRepository.deleteById(id);
    }
}
