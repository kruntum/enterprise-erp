package com.example.erp.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@Tag(name = "Home", description = "Root endpoint")
public class HomeController {

    @Operation(summary = "Check server status", description = "Returns a message indicating the server is running.")
    @GetMapping("/")
    public ResponseEntity<?> home() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "running");
        status.put("message", "Enterprise ERP Backend is up and running.");
        return ResponseEntity.ok(status);
    }
}
