package com.example.erp.config;

import com.example.erp.model.*;
import com.example.erp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final MenuRepository menuRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Starting data seeding...");

        seedPermissions();
        seedRoles();
        seedAdminUser();
        seedDefaultMenus();

        log.info("Data seeding completed successfully!");
    }

    private void seedPermissions() {
        if (permissionRepository.count() == 0) {
            log.info("Seeding permissions...");

            Permission canViewUser = new Permission();
            canViewUser.setName("CAN_VIEW_USER");
            canViewUser.setDescription("Can view users");

            Permission canCreateUser = new Permission();
            canCreateUser.setName("CAN_CREATE_USER");
            canCreateUser.setDescription("Can create new users");

            Permission canUpdateUser = new Permission();
            canUpdateUser.setName("CAN_UPDATE_USER");
            canUpdateUser.setDescription("Can update existing users");

            Permission canDeleteUser = new Permission();
            canDeleteUser.setName("CAN_DELETE_USER");
            canDeleteUser.setDescription("Can delete users");

            Permission canViewRole = new Permission();
            canViewRole.setName("CAN_VIEW_ROLE");
            canViewRole.setDescription("Can view roles");

            Permission canViewMenu = new Permission();
            canViewMenu.setName("CAN_VIEW_MENU");
            canViewMenu.setDescription("Can view menus");

            Permission canCreateMenu = new Permission();
            canCreateMenu.setName("CAN_CREATE_MENU");
            canCreateMenu.setDescription("Can create new menus");

            Permission canUpdateMenu = new Permission();
            canUpdateMenu.setName("CAN_UPDATE_MENU");
            canUpdateMenu.setDescription("Can update existing menus");

            Permission canDeleteMenu = new Permission();
            canDeleteMenu.setName("CAN_DELETE_MENU");
            canDeleteMenu.setDescription("Can delete menus");

            Permission canViewPermission = new Permission();
            canViewPermission.setName("CAN_VIEW_PERMISSION");
            canViewPermission.setDescription("Can view permissions");

            permissionRepository.saveAll(List.of(
                    canViewUser,
                    canCreateUser,
                    canUpdateUser,
                    canDeleteUser,
                    canViewRole,
                    canViewMenu,
                    canCreateMenu,
                    canUpdateMenu,
                    canDeleteMenu,
                    canViewPermission));

            log.info(
                    "Permissions seeded: User, Role, Menu, and Permission permissions");
        } else {
            log.info("Permissions already exist, skipping permission seeding");
        }
    }

    private void seedRoles() {
        if (roleRepository.count() == 0) {
            log.info("Seeding roles...");

            // Get permissions
            Permission canViewUser = permissionRepository.findByName("CAN_VIEW_USER").orElse(null);
            Permission canCreateUser = permissionRepository.findByName("CAN_CREATE_USER").orElse(null);
            Permission canUpdateUser = permissionRepository.findByName("CAN_UPDATE_USER").orElse(null);
            Permission canDeleteUser = permissionRepository.findByName("CAN_DELETE_USER").orElse(null);
            Permission canViewRole = permissionRepository.findByName("CAN_VIEW_ROLE").orElse(null);
            Permission canViewMenu = permissionRepository.findByName("CAN_VIEW_MENU").orElse(null);
            Permission canCreateMenu = permissionRepository.findByName("CAN_CREATE_MENU").orElse(null);
            Permission canUpdateMenu = permissionRepository.findByName("CAN_UPDATE_MENU").orElse(null);
            Permission canDeleteMenu = permissionRepository.findByName("CAN_DELETE_MENU").orElse(null);
            Permission canViewPermission = permissionRepository.findByName("CAN_VIEW_PERMISSION").orElse(null);

            // ROLE_USER - can only view
            Role userRole = new Role();
            userRole.setName("ROLE_USER");
            userRole.setDescription("Standard user role");
            userRole.setPermissions(new HashSet<>(Arrays.asList(canViewUser)));

            // ROLE_HR - can view and manage users
            Role hrRole = new Role();
            hrRole.setName("ROLE_HR");
            hrRole.setDescription("Human Resources role");
            hrRole.setPermissions(new HashSet<>(Arrays.asList(
                    canViewUser,
                    canCreateUser,
                    canUpdateUser)));

            // ROLE_ADMIN - has all permissions
            Role adminRole = new Role();
            adminRole.setName("ROLE_ADMIN");
            adminRole.setDescription("Administrator role with full access");
            adminRole.setPermissions(new HashSet<>(Arrays.asList(
                    canViewUser,
                    canCreateUser,
                    canUpdateUser,
                    canDeleteUser,
                    canViewRole,
                    canViewMenu,
                    canCreateMenu,
                    canUpdateMenu,
                    canDeleteMenu,
                    canViewPermission)));

            roleRepository.saveAll(Arrays.asList(userRole, hrRole, adminRole));
            log.info("Roles seeded with permissions: ROLE_USER, ROLE_HR, ROLE_ADMIN");
        } else {
            log.info("Roles already exist, skipping role seeding");
        }
    }

    private void seedAdminUser() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            log.info("Seeding admin user...");

            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));

            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@admin.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRoles(new HashSet<>(Arrays.asList(adminRole)));

            userRepository.save(admin);
            log.info("Admin user created: username=admin, password=admin123");
        } else {
            log.info("Admin user already exists, skipping admin user seeding");
        }
    }

    private void seedDefaultMenus() {
        if (menuRepository.count() == 0) {
            log.info("Seeding default menus...");

            Menu dashboard = new Menu();
            dashboard.setLabel("Dashboard");
            dashboard.setPath("/dashboard");
            dashboard.setIcon("dashboard");
            dashboard.setPermissionRequired(null); // Accessible to all
            dashboard.setParentId(null);
            dashboard.setSortOrder(1);

            Menu userManagement = new Menu();
            userManagement.setLabel("User Management");
            userManagement.setPath("/users");
            userManagement.setIcon("people");
            userManagement.setPermissionRequired("CAN_VIEW_USER");
            userManagement.setParentId(null);
            userManagement.setSortOrder(2);

            Menu roleManagement = new Menu();
            roleManagement.setLabel("Role Management");
            roleManagement.setPath("/roles");
            roleManagement.setIcon("shield");
            roleManagement.setPermissionRequired("ROLE_ADMIN");
            roleManagement.setParentId(null);
            roleManagement.setSortOrder(3);

            Menu permissionManagement = new Menu();
            permissionManagement.setLabel("Permission Management");
            permissionManagement.setPath("/permissions");
            permissionManagement.setIcon("lock");
            permissionManagement.setPermissionRequired("ROLE_ADMIN");
            permissionManagement.setParentId(null);
            permissionManagement.setSortOrder(4);

            Menu menuManagement = new Menu();
            menuManagement.setLabel("Menu Management");
            menuManagement.setPath("/menus");
            menuManagement.setIcon("menu");
            menuManagement.setPermissionRequired("ROLE_ADMIN");
            menuManagement.setParentId(null);
            menuManagement.setSortOrder(5);

            menuRepository.saveAll(Arrays.asList(
                    dashboard,
                    userManagement,
                    roleManagement,
                    permissionManagement,
                    menuManagement));

            log.info(
                    "Default menus seeded: Dashboard, User Management, Role Management, Permission Management, Menu Management");
        } else {
            log.info("Menus already exist, skipping menu seeding");
        }
    }
}
