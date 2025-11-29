package com.example.erp.service;

import com.example.erp.model.Menu;
import com.example.erp.repository.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MenuService {

    @Autowired
    MenuRepository menuRepository;

    public List<Menu> getMenuTree() {
        List<Menu> allMenus = menuRepository.findAllByOrderBySortOrderAsc();
        return buildTree(allMenus);
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
