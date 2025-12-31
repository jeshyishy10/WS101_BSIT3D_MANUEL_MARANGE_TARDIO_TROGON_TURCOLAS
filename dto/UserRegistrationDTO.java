// src/main/java/com/uep/lostfound/dto/UserRegistrationDTO.java
package com.uep.lostfound.dto;

import com.uep.lostfound.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UserRegistrationDTO {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;

    @NotBlank(message = "UEP ID is required")
    @Pattern(regexp = "^(\\d{4}-\\d{5}|FAC-\\d{3}|STAFF-\\d{3})$",
            message = "Invalid UEP ID format. Use: YYYY-XXXXX (Student), FAC-XXX (Faculty), or STAFF-XXX (Staff)")
    private String uepId;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    private String department;

    @Pattern(regexp = "^(09|\\+639)\\d{9}$",
            message = "Invalid Philippine phone number format. Use: 09xxxxxxxxx or +639xxxxxxxxx")
    private String phoneNumber;

    @AssertTrue(message = "You must agree to the terms and conditions")
    private boolean termsAgreement;
}