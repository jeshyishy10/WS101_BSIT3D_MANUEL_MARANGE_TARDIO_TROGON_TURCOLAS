package lk.ijse.cmjd108.LostAndFoundSystem.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class HomeController {

    // GET: http://localhost:8082/
    @GetMapping("/")
    public ResponseEntity<Map<String, String>> home() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "✅ Lost & Found System Backend");
        response.put("status", "RUNNING");
        response.put("port", "8082");
        return ResponseEntity.ok(response);
    }

    // CHANGE THIS: Use a different path to avoid conflict
    // GET: http://localhost:8082/api/home-test
    @GetMapping("/api/home-test")
    public ResponseEntity<Map<String, Object>> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Home Controller API is working!");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    // POST: http://localhost:8082/api/auth/login
    @PostMapping("/api/auth/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = credentials.get("email");
            String password = credentials.get("password");

            System.out.println("Login attempt: " + email);

            // Test credentials
            if ("admin@test.com".equals(email) && "admin123".equals(password)) {
                response.put("success", true);
                response.put("message", "Login successful");
                response.put("token", "eyJhbGciOiJIUzI1NiJ9.test-jwt-token-" + System.currentTimeMillis());
                response.put("user", Map.of(
                        "id", 1,
                        "name", "Admin User",
                        "email", email,
                        "role", "admin"
                ));
            } else {
                response.put("success", false);
                response.put("message", "Invalid credentials");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Login error: " + e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    // Simple health check
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Lost and Found System");
        return ResponseEntity.ok(response);
    }
}