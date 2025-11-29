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

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final MenuRepository menuRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Starting data seeding...");

        seedRoles();
        seedAdminUser();
        seedDefaultMenus();

        log.info("Data seeding completed successfully!");
    }

    private void seedRoles() {
        if (roleRepository.count() == 0) {
            log.info("Seeding roles...");

            Role userRole = new Role();
            userRole.setName(RoleName.ROLE_USER);
            userRole.setPermissions(new HashSet<>());

            Role hrRole = new Role();
            hrRole.setName(RoleName.ROLE_HR);
            hrRole.setPermissions(new HashSet<>());

            Role adminRole = new Role();
            adminRole.setName(RoleName.ROLE_ADMIN);
            adminRole.setPermissions(new HashSet<>());

            roleRepository.saveAll(Arrays.asList(userRole, hrRole, adminRole));
            log.info("Roles seeded: ROLE_USER, ROLE_HR, ROLE_ADMIN");
        } else {
            log.info("Roles already exist, skipping role seeding");
        }
    }

    private void seedAdminUser() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            log.info("Seeding admin user...");

            Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
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
            userManagement.setPermissionRequired("CAN_MANAGE_USERS");
            userManagement.setParentId(null);
            userManagement.setSortOrder(2);

            Menu reports = new Menu();
            reports.setLabel("Reports");
            reports.setPath("/reports");
            reports.setIcon("assessment");
            reports.setPermissionRequired(null);
            reports.setParentId(null);
            reports.setSortOrder(3);

            Menu settings = new Menu();
            settings.setLabel("Settings");
            settings.setPath("/settings");
            settings.setIcon("settings");
            settings.setPermissionRequired("CAN_MANAGE_SETTINGS");
            settings.setParentId(null);
            settings.setSortOrder(4);

            menuRepository.saveAll(Arrays.asList(dashboard, userManagement, reports, settings));
            log.info("Default menus seeded: Dashboard, User Management, Reports, Settings");
        } else {
            log.info("Menus already exist, skipping menu seeding");
        }
    }
}
