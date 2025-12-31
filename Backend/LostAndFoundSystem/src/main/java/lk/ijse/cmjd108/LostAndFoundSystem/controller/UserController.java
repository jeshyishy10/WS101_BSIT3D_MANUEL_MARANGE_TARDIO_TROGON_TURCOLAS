package lk.ijse.cmjd108.LostAndFoundSystem.controller;

import lk.ijse.cmjd108.LostAndFoundSystem.dao.UserDao;
import lk.ijse.cmjd108.LostAndFoundSystem.dto.Role;
import lk.ijse.cmjd108.LostAndFoundSystem.dto.UserDTO;
import lk.ijse.cmjd108.LostAndFoundSystem.entity.User;
import lk.ijse.cmjd108.LostAndFoundSystem.exception.UserNotFoundException;
import lk.ijse.cmjd108.LostAndFoundSystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/User")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserDao userDao;

    public UserController() {
        System.out.println("✅ UserController initialized!");
    }

    // FIXED: Changed from private to public
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserDTO userDTO) {
        System.out.println("📝 POST /User/register called with: " +
                (userDTO != null ? userDTO.getEmail() : "null"));

        if (userDTO == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Request body is required")
            );
        }

        try {
            userService.addUser(userDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of("message", "User registered successfully",
                            "email", userDTO.getEmail())
            );
        } catch (Exception e) {
            System.out.println("❌ Registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("error", "Registration failed: " + e.getMessage())
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO userDTO) {
        System.out.println("🔐 POST /User/login called with email: " +
                (userDTO != null ? userDTO.getEmail() : "null"));

        if (userDTO == null || userDTO.getEmail() == null || userDTO.getPassword() == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Email and password are required")
            );
        }

        try {
            UserDTO response = userService.login(userDTO);
            System.out.println("✅ Login successful for: " + userDTO.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Login failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("error", "Login failed: " + e.getMessage(),
                            "isLogin", false)
            );
        }
    }

    // ADD THIS: Simple GET login page for testing
    @GetMapping("/login")
    public ResponseEntity<?> loginPage() {
        System.out.println("ℹ️ GET /User/login called - showing login page info");
        return ResponseEntity.ok(Map.of(
                "message", "Please use POST method to login",
                "example", Map.of(
                        "method", "POST",
                        "url", "http://localhost:8082/User/login",
                        "headers", Map.of("Content-Type", "application/json"),
                        "body", Map.of(
                                "email", "your-email@example.com",
                                "password", "your-password"
                        )
                )
        ));
    }

    // ADD THIS: Simple GET register page for testing
    @GetMapping("/register")
    public ResponseEntity<?> registerPage() {
        System.out.println("ℹ️ GET /User/register called - showing register page info");
        return ResponseEntity.ok(Map.of(
                "message", "Please use POST method to register",
                "example", Map.of(
                        "method", "POST",
                        "url", "http://localhost:8082/User/register",
                        "headers", Map.of("Content-Type", "application/json"),
                        "body", Map.of(
                                "email", "new-user@example.com",
                                "password", "secure-password",
                                "firstName", "John",
                                "lastName", "Doe"
                        )
                )
        ));
    }

    @PutMapping(value = "/adminUserStaff/{userId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateUserDetails(@PathVariable String userId, @RequestBody UserDTO userDTO) {
        if (userId == null || userDTO == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User ID and data are required"));
        }
        try {
            userService.updateUserDetails(userId, userDTO);
            return ResponseEntity.ok(Map.of("message", "User updated successfully"));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserDTO> users = userService.getAllUsers();
            return ResponseEntity.ok(Map.of("users", users, "count", users.size()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/adminUserStaff/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable String userId) {
        try {
            UserDTO user = userService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/admin/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
        }
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<?> checkEmailExists(@PathVariable String email) {
        try {
            boolean exists = userDao.findByEmail(email).isPresent();
            Map<String, Object> response = new HashMap<>();
            response.put("email", email);
            response.put("exists", exists);

            if (exists) {
                User user = userDao.findByEmail(email).get();
                response.put("userId", user.getUserId());
                response.put("name", user.getName());
                response.put("role", user.getRole() != null ? user.getRole().name() : "NULL");
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/fix-role/{email}")
    public ResponseEntity<?> fixUserRole(@PathVariable String email,
                                         @RequestParam(required = false, defaultValue = "USER") String role) {
        try {
            User user = userDao.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

            Role newRole;
            try {
                newRole = Role.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException e) {
                newRole = Role.USER;
            }

            user.setRole(newRole);
            userDao.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Role updated successfully",
                    "email", email,
                    "newRole", newRole.name()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/list-all")
    public ResponseEntity<?> listAllUsers() {
        List<User> users = userDao.findAll();
        return ResponseEntity.ok(Map.of("users", users, "count", users.size()));
    }

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        System.out.println("✅ GET /User/test endpoint called!");
        return ResponseEntity.ok(Map.of(
                "message", "UserController is working!",
                "status", "OK",
                "endpoints", List.of(
                        "POST /User/register - Register new user",
                        "POST /User/login - User login",
                        "GET  /User/test - Test endpoint",
                        "GET  /User/check-email/{email} - Check if email exists",
                        "GET  /User/list-all - List all users"
                )
        ));
    }

    // ADD THIS: Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "UserController",
                "timestamp", System.currentTimeMillis()
        ));
    }
}