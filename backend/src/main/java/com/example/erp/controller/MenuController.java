package com.example.erp.controller;

import com.example.erp.model.Menu;
import com.example.erp.repository.MenuRepository;
import com.example.erp.service.MenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/menus")
@Tag(name = "Menu Management", description = "APIs for managing application menus")
@SecurityRequirement(name = "Bearer Authentication")
public class MenuController {

    @Autowired
    MenuService menuService;

    @Autowired
    MenuRepository menuRepository;

    @Operation(summary = "Get all menus", description = "Retrieve the menu tree structure.")
    @GetMapping
    public List<Menu> getMenus() {
        return menuService.getMenuTree();
    }

    @Operation(summary = "Get menu by ID", description = "Retrieve a specific menu item by ID.")
    @GetMapping("/{id}")
    public Menu getMenuById(@PathVariable Long id) {
        return menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu not found"));
    }

    @Operation(summary = "Create menu", description = "Create a new menu item.")
    @PostMapping
    public Menu createMenu(@RequestBody Menu menu) {
        return menuRepository.save(menu);
    }

    @Operation(summary = "Update menu", description = "Update an existing menu item.")
    @PutMapping("/{id}")
    public Menu updateMenu(@PathVariable Long id, @RequestBody Menu menuDetails) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu not found"));

        menu.setLabel(menuDetails.getLabel());
        menu.setPath(menuDetails.getPath());
        menu.setIcon(menuDetails.getIcon());
        menu.setPermissionRequired(menuDetails.getPermissionRequired());
        menu.setParentId(menuDetails.getParentId());
        menu.setSortOrder(menuDetails.getSortOrder());

        return menuRepository.save(menu);
    }

    @Operation(summary = "Delete menu", description = "Delete a menu item by ID.")
    @DeleteMapping("/{id}")
    public void deleteMenu(@PathVariable Long id) {
        menuRepository.deleteById(id);
    }
}
