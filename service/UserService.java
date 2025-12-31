package com.uep.lostfound.service;

import com.uep.lostfound.model.User;
import com.uep.lostfound.enums.Role;
import com.uep.lostfound.dto.UserRegistrationDTO;
import com.uep.lostfound.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ========== REGISTRATION METHODS ==========

    /**
     * Register a new user from registration DTO
     */
    public User registerUser(UserRegistrationDTO registrationDTO) {
        System.out.println("=== REGISTER USER FROM DTO START ===");
        System.out.println("Email: " + registrationDTO.getEmail());
        System.out.println("UEP ID: " + registrationDTO.getUepId());
        System.out.println("Role: " + registrationDTO.getRole());

        // Validate email uniqueness
        if (userRepository.existsByEmail(registrationDTO.getEmail())) {
            System.out.println("ERROR: Email already exists: " + registrationDTO.getEmail());
            throw new RuntimeException("Email already registered");
        }

        // Validate UEP ID uniqueness
        if (userRepository.existsByUepId(registrationDTO.getUepId())) {
            System.out.println("ERROR: UEP ID already exists: " + registrationDTO.getUepId());
            throw new RuntimeException("UEP ID already registered");
        }

        // Create User entity from DTO
        User user = new User();
        user.setFirstName(registrationDTO.getFirstName());
        user.setLastName(registrationDTO.getLastName());
        user.setUepId(registrationDTO.getUepId());
        user.setEmail(registrationDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDTO.getPassword()));
        user.setRole(registrationDTO.getRole() != null ? registrationDTO.getRole() : Role.STUDENT);
        user.setDepartment(registrationDTO.getDepartment());
        user.setPhoneNumber(registrationDTO.getPhoneNumber());
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        System.out.println("Saving user to database...");
        User savedUser = userRepository.save(user);
        System.out.println("User saved with ID: " + savedUser.getId());
        System.out.println("=== REGISTER USER END ===");

        return savedUser;
    }

    /**
     * Register a new user from User entity (for backward compatibility)
     */
    public User registerUser(User user) {
        System.out.println("=== REGISTER USER FROM ENTITY START ===");
        System.out.println("Email: " + user.getEmail());
        System.out.println("UEP ID: " + user.getUepId());

        // Check if email exists
        if (userRepository.existsByEmail(user.getEmail())) {
            System.out.println("ERROR: Email already exists: " + user.getEmail());
            throw new RuntimeException("Email already registered");
        }

        // Check if UEP ID exists
        if (user.getUepId() != null && !user.getUepId().trim().isEmpty()) {
            if (userRepository.existsByUepId(user.getUepId())) {
                System.out.println("ERROR: UEP ID already exists: " + user.getUepId());
                throw new RuntimeException("UEP ID already registered");
            }
        }

        // Encode password
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        System.out.println("Password encoded");
        user.setPassword(encodedPassword);

        // Set default values if not provided
        if (user.getRole() == null) {
            user.setRole(Role.STUDENT); // FIXED: Changed from Role.user to Role.STUDENT
            System.out.println("Setting default role: STUDENT");
        }

        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        System.out.println("Saving user to database...");
        User savedUser = userRepository.save(user);
        System.out.println("User saved with ID: " + savedUser.getId());
        System.out.println("=== REGISTER USER END ===");

        return savedUser;
    }

    // ========== GET METHODS ==========

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getRecentUsers(int count) {
        // Using findAll() and sorting manually since you don't have the method
        return userRepository.findAll().stream()
                .sorted((u1, u2) -> u2.getCreatedAt().compareTo(u1.getCreatedAt()))
                .limit(count)
                .toList();
    }

    public List<User> getActiveUsers() {
        return userRepository.findByActiveTrue();
    }

    public List<User> getInactiveUsers() {
        return userRepository.findByActiveFalse();
    }

    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public List<User> getAllAdmins() {
        return userRepository.findByRole(Role.ADMIN);
    }

    public List<User> getAllRegularUsers() {
        // Fixed: Using findNonAdminUsers() method
        return userRepository.findNonAdminUsers();
    }

    public List<User> findByRoleNot(Role role) {
        // Fixed: Using query method with proper role string
        return userRepository.findByRoleNot(role.name());
    }

    // ========== VALIDATION METHODS ==========

    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean uepIdExists(String uepId) {
        return userRepository.existsByUepId(uepId);
    }

    // ========== COUNT METHODS ==========

    public Long countAllUsers() {
        return userRepository.count();
    }

    public Long countActiveUsers() {
        // Since countByActiveTrue() returns long, cast to Long
        return (long) userRepository.countByActiveTrue();
    }

    // ========== UPDATE METHODS ==========

    @Transactional
    public User updateUserProfile(Long userId, User updatedUser) {
        User user = getUserById(userId);

        // Check if email is being changed and is unique
        if (!user.getEmail().equals(updatedUser.getEmail()) &&
                userRepository.existsByEmail(updatedUser.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Check if UEP ID is being changed and is unique
        if (!user.getUepId().equals(updatedUser.getUepId()) &&
                userRepository.existsByUepId(updatedUser.getUepId())) {
            throw new RuntimeException("UEP ID already exists");
        }

        user.setFirstName(updatedUser.getFirstName());
        user.setLastName(updatedUser.getLastName());
        user.setUepId(updatedUser.getUepId());
        user.setEmail(updatedUser.getEmail());
        user.setPhoneNumber(updatedUser.getPhoneNumber());
        user.setDepartment(updatedUser.getDepartment());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    @Transactional
    public void updateUserRole(Long userId, Role role) {
        User user = getUserById(userId);
        user.setRole(role);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public boolean changePassword(Long userId, String currentPassword, String newPassword) {
        User user = getUserById(userId);

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return false;
        }

        // Update to new password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return true;
    }

    @Transactional
    public void resetPassword(Long userId, String newPassword) {
        User user = getUserById(userId);
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public void updateLastLogin(Long userId) {
        User user = getUserById(userId);
        user.setLastLogin(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    // ========== STATUS MANAGEMENT ==========

    @Transactional
    public void toggleBlockUser(Long id) {
        User user = getUserById(id);
        user.setActive(!user.isActive());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public void deactivateUser(Long userId) {
        User user = getUserById(userId);
        user.setActive(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public void activateUser(Long userId) {
        User user = getUserById(userId);
        user.setActive(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    // ========== DELETE METHODS ==========

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    @Transactional
    public void deleteByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        userRepository.delete(user);
    }

    // ========== SEARCH METHODS ==========

    public List<User> searchUsers(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return userRepository.findAll();
        }
        return userRepository.searchUsers(keyword.trim());
    }

    public List<User> searchByDepartment(String department) {
        if (department == null || department.trim().isEmpty()) {
            return List.of();
        }
        return userRepository.findByDepartmentContainingIgnoreCase(department.trim());
    }

    // ========== STATISTICS METHODS ==========

    public UserStatistics getUserStatistics() {
        long totalUsers = countAllUsers();
        long activeUsers = getActiveUsers().size();
        long inactiveUsers = getInactiveUsers().size();
        long admins = getAllAdmins().size();
        long students = getUsersByRole(Role.STUDENT).size();
        long faculty = getUsersByRole(Role.FACULTY).size();
        long staff = getUsersByRole(Role.STAFF).size();

        return new UserStatistics(totalUsers, activeUsers, inactiveUsers, admins, students, faculty, staff);
    }

    // Enhanced Statistics DTO
    public record UserStatistics(
            long totalUsers,
            long activeUsers,
            long inactiveUsers,
            long admins,
            long students,
            long faculty,
            long staff
    ) {}

    // Get user count by role
    public long countByRole(Role role) {
        return userRepository.countByRole(role);
    }

    // Get recent registrations count
    public long countRecentRegistrations(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return userRepository.findUsersRegisteredAfter(since).size();
    }

    // ========== UTILITY METHODS ==========

    public boolean verifyPassword(Long userId, String password) {
        User user = getUserById(userId);
        return passwordEncoder.matches(password, user.getPassword());
    }

    public boolean isUserActive(Long userId) {
        User user = getUserById(userId);
        return user.isActive();
    }

    public Optional<User> findByUepId(String uepId) {
        return userRepository.findByUepId(uepId);
    }

    // Bulk operations
    @Transactional
    public void deactivateMultipleUsers(List<Long> userIds) {
        for (Long userId : userIds) {
            try {
                deactivateUser(userId);
            } catch (Exception e) {
                System.err.println("Failed to deactivate user " + userId + ": " + e.getMessage());
            }
        }
    }

    @Transactional
    public void activateMultipleUsers(List<Long> userIds) {
        for (Long userId : userIds) {
            try {
                activateUser(userId);
            } catch (Exception e) {
                System.err.println("Failed to activate user " + userId + ": " + e.getMessage());
            }
        }
    }

    // Check if user can be deleted (no related records)
    public boolean canDeleteUser(Long userId) {
        User user = getUserById(userId);
        // Add your business logic here
        // For example, check if user has any created items, reports, etc.
        return true; // Default to true, modify as needed
    }

    // Import users from list (for admin)
    @Transactional
    public List<User> importUsers(List<UserRegistrationDTO> users) {
        List<User> importedUsers = new java.util.ArrayList<>();

        for (UserRegistrationDTO userDTO : users) {
            try {
                User user = registerUser(userDTO);
                importedUsers.add(user);
            } catch (Exception e) {
                System.err.println("Failed to import user " + userDTO.getEmail() + ": " + e.getMessage());
            }
        }

        return importedUsers;
    }

    // Export users data
    public List<UserExportDTO> exportUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserExportDTO(
                        user.getId(),
                        user.getUepId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail(),
                        user.getRole().name(),
                        user.getDepartment(),
                        user.getPhoneNumber(),
                        user.isActive(),
                        user.getCreatedAt(),
                        user.getLastLogin()
                ))
                .toList();
    }

    // Export DTO
    public record UserExportDTO(
            Long id,
            String uepId,
            String firstName,
            String lastName,
            String email,
            String role,
            String department,
            String phoneNumber,
            boolean active,
            LocalDateTime createdAt,
            LocalDateTime lastLogin
    ) {}
}