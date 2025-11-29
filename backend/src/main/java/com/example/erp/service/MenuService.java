package com.example.erp.service;

import com.example.erp.model.Menu;
import com.example.erp.repository.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MenuService {

    @Autowired
    MenuRepository menuRepository;

    public List<Menu> getMenuTree() {
        List<Menu> allMenus = menuRepository.findAllByOrderBySortOrderAsc();

        // Filter menus based on current user's permissions
        List<Menu> accessibleMenus = filterMenusByPermission(allMenus);

        return buildTree(accessibleMenus);
    }

    private List<Menu> filterMenusByPermission(List<Menu> menus) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            return new ArrayList<>();
        }

        List<String> userAuthorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return menus.stream()
                .filter(menu -> hasPermission(menu, userAuthorities))
                .collect(Collectors.toList());
    }

    private boolean hasPermission(Menu menu, List<String> userAuthorities) {
        // If no permission required, everyone can access
        if (menu.getPermissionRequired() == null || menu.getPermissionRequired().isEmpty()) {
            return true;
        }

        // Check if user has the required permission
        if (userAuthorities.contains(menu.getPermissionRequired())) {
            return true;
        }

        // Admins can access everything
        return userAuthorities.contains("ROLE_ADMIN");
    }

    private List<Menu> buildTree(List<Menu> menus) {
        Map<Long, Menu> menuMap = new HashMap<>();
        List<Menu> roots = new ArrayList<>();

        for (Menu menu : menus) {
            menuMap.put(menu.getId(), menu);
        }

        for (Menu menu : menus) {
            if (menu.getParentId() == null) {
                roots.add(menu);
            } else {
                Menu parent = menuMap.get(menu.getParentId());
                if (parent != null) {
                    parent.getChildren().add(menu);
                }
            }
        }
        return roots;
    }
}
