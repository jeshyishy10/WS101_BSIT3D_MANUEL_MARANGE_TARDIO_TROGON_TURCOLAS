package com.uep.lostfound.repository;

import com.uep.lostfound.model.User;
import com.uep.lostfound.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // ========== BASIC CRUD OPERATIONS ==========
    Optional<User> findByEmail(String email);
    Optional<User> findByUepId(String uepId);
    boolean existsByEmail(String email);
    boolean existsByUepId(String uepId);

    // ========== USER STATUS QUERIES ==========
    List<User> findByActiveTrue();
    List<User> findByActiveFalse();
    long countByActiveTrue();
    long countByActiveFalse();

    // ========== ROLE-BASED QUERIES ==========
    List<User> findByRole(Role role);
    long countByRole(Role role);
    List<User> findByRoleAndActiveTrue(Role role);

    // Find all admins - FIXED: Use the existing findByRole method
    default List<User> findAdmins() {
        return findByRole(Role.ADMIN);
    }

    // Find all non-admin users
    @Query("SELECT u FROM User u WHERE u.role != 'ADMIN'")
    List<User> findNonAdminUsers();

    // Find users excluding a specific role
    @Query("SELECT u FROM User u WHERE u.role <> :role")
    List<User> findByRoleNot(@Param("role") String role);

    // Find users excluding a specific role by string
    @Query("SELECT u FROM User u WHERE u.role <> :role")
    List<User> findByRoleNotString(@Param("role") String role);

    // Find by role and status
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.active = :active")
    List<User> findByRoleAndStatus(@Param("role") Role role, @Param("active") boolean active);

    // ========== EMAIL AND UEP ID VERIFICATION ==========
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.email = :email")
    boolean isEmailExists(@Param("email") String email);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.uepId = :uepId")
    boolean isUepIdExists(@Param("uepId") String uepId);

    // ========== SEARCH FUNCTIONALITY ==========
    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.uepId) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.department) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<User> searchUsers(@Param("keyword") String keyword);

    // Advanced search with role filter
    @Query("SELECT u FROM User u WHERE " +
            "(:firstName IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :firstName, '%'))) AND " +
            "(:lastName IS NULL OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :lastName, '%'))) AND " +
            "(:email IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
            "(:role IS NULL OR u.role = :role) AND " +
            "(:active IS NULL OR u.active = :active)")
    List<User> advancedSearch(
            @Param("firstName") String firstName,
            @Param("lastName") String lastName,
            @Param("email") String email,
            @Param("role") Role role,
            @Param("active") Boolean active
    );

    // ========== ORDERING QUERIES ==========
    List<User> findAllByOrderByCreatedAtDesc();
    List<User> findAllByOrderByLastNameAsc();
    List<User> findByActiveTrueOrderByCreatedAtDesc();

    // Find recent users with limit
    @Query("SELECT u FROM User u ORDER BY u.createdAt DESC")
    List<User> findRecentUsers(Pageable pageable);

    // ========== STATISTICS QUERIES ==========
    @Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
    List<Object[]> countUsersByRole();

    @Query("SELECT COUNT(u) FROM User u WHERE u.active = true AND u.role = :role")
    long countActiveUsersByRole(@Param("role") Role role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.active = false AND u.role = :role")
    long countInactiveUsersByRole(@Param("role") Role role);

    // ========== TIME-BASED QUERIES ==========
    @Query("SELECT u FROM User u WHERE u.createdAt >= :date ORDER BY u.createdAt DESC")
    List<User> findUsersRegisteredAfter(@Param("date") LocalDateTime date);

    @Query("SELECT u FROM User u WHERE u.lastLogin IS NULL OR u.lastLogin < :date")
    List<User> findInactiveUsersSince(@Param("date") LocalDateTime date);

    @Query("SELECT u FROM User u WHERE u.lastLogin >= :date ORDER BY u.lastLogin DESC")
    List<User> findRecentlyActiveUsers(@Param("date") LocalDateTime date);

    // ========== DATA INTEGRITY QUERIES ==========
    @Query("SELECT u.email, COUNT(u) FROM User u GROUP BY u.email HAVING COUNT(u) > 1")
    List<Object[]> findDuplicateEmails();

    @Query("SELECT u.uepId, COUNT(u) FROM User u GROUP BY u.uepId HAVING COUNT(u) > 1")
    List<Object[]> findDuplicateUepIds();

    @Query("SELECT u FROM User u WHERE u.phoneNumber IS NULL OR u.phoneNumber = ''")
    List<User> findUsersWithoutPhoneNumber();

    @Query("SELECT u FROM User u WHERE u.department IS NULL OR u.department = ''")
    List<User> findUsersWithoutDepartment();

    // ========== PAGINATION SUPPORT ==========
    @Query("SELECT u FROM User u WHERE u.active = :active ORDER BY u.lastName, u.firstName")
    Page<User> findByActiveWithPagination(@Param("active") boolean active, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.role = :role ORDER BY u.createdAt DESC")
    Page<User> findByRoleWithPagination(@Param("role") Role role, Pageable pageable);

    @Query("SELECT u FROM User u ORDER BY u.lastName, u.firstName")
    Page<User> findAllWithPagination(Pageable pageable);

    // ========== DEPARTMENT-BASED QUERIES ==========
    List<User> findByDepartment(String department);
    List<User> findByDepartmentContainingIgnoreCase(String department);

    @Query("SELECT u FROM User u WHERE u.department IS NOT NULL AND u.department <> '' ORDER BY u.department")
    List<User> findAllWithDepartment();

    // ========== PHONE NUMBER QUERIES ==========
    @Query("SELECT u FROM User u WHERE u.phoneNumber LIKE %:phonePattern%")
    List<User> findByPhoneNumberContaining(@Param("phonePattern") String phonePattern);

    @Query("SELECT u FROM User u WHERE u.phoneNumber LIKE '09%'")
    List<User> findUsersWithLocalPhoneNumber();

    @Query("SELECT u FROM User u WHERE u.phoneNumber LIKE '+63%'")
    List<User> findUsersWithInternationalPhoneNumber();

    // ========== DEPARTMENT STATISTICS ==========
    @Query("SELECT u.department, COUNT(u) FROM User u WHERE u.department IS NOT NULL AND u.department <> '' GROUP BY u.department ORDER BY COUNT(u) DESC")
    List<Object[]> countUsersByDepartment();

    @Query("SELECT u.department, COUNT(u) FROM User u WHERE u.active = true AND u.department IS NOT NULL GROUP BY u.department")
    List<Object[]> countActiveUsersByDepartment();

    // ========== CUSTOM FIND METHODS ==========
    @Query("SELECT u FROM User u WHERE u.firstName = :firstName AND u.lastName = :lastName")
    List<User> findByFullName(@Param("firstName") String firstName, @Param("lastName") String lastName);

    @Query("SELECT u FROM User u WHERE u.firstName LIKE %:name% OR u.lastName LIKE %:name%")
    List<User> findByAnyName(@Param("name") String name);

    @Query("SELECT u FROM User u WHERE YEAR(u.createdAt) = :year")
    List<User> findByRegistrationYear(@Param("year") int year);

    @Query("SELECT u FROM User u WHERE MONTH(u.createdAt) = :month AND YEAR(u.createdAt) = :year")
    List<User> findByRegistrationMonth(@Param("month") int month, @Param("year") int year);

    // ========== BULK OPERATION SUPPORT ==========
    @Query("SELECT u FROM User u WHERE u.id IN :ids")
    List<User> findByIds(@Param("ids") List<Long> ids);

    @Query("SELECT u FROM User u WHERE u.email IN :emails")
    List<User> findByEmails(@Param("emails") List<String> emails);

    @Query("SELECT u FROM User u WHERE u.uepId IN :uepIds")
    List<User> findByUepIds(@Param("uepIds") List<String> uepIds);

    // ========== SECURITY & AUTHENTICATION ==========
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.active = true")
    Optional<User> findActiveUserByEmail(@Param("email") String email);

    @Query("SELECT u FROM User u WHERE u.uepId = :uepId AND u.active = true")
    Optional<User> findActiveUserByUepId(@Param("uepId") String uepId);

    @Query("SELECT u FROM User u WHERE (u.email = :identifier OR u.uepId = :identifier) AND u.active = true")
    Optional<User> findActiveUserByIdentifier(@Param("identifier") String identifier);

    // ========== ADMINISTRATIVE QUERIES ==========
    @Query("SELECT u FROM User u WHERE u.role = 'ADMIN' AND u.active = true")
    List<User> findActiveAdmins();

    @Query("SELECT u FROM User u WHERE u.role != 'ADMIN' AND u.active = true ORDER BY u.role, u.lastName")
    List<User> findActiveNonAdminUsers();

    @Query("SELECT u.role, u.department, COUNT(u) FROM User u WHERE u.active = true GROUP BY u.role, u.department")
    List<Object[]> getActiveUsersByRoleAndDepartment();

    // ========== PERFORMANCE OPTIMIZATION ==========
    @Query("SELECT u.id, u.firstName, u.lastName, u.email, u.role FROM User u WHERE u.active = true")
    List<Object[]> findActiveUserSummaries();

    @Query("SELECT new map(u.id as id, u.uepId as uepId, u.firstName as firstName, u.lastName as lastName, u.email as email, u.role as role) FROM User u")
    List<?> findAllUserSummaries();
}