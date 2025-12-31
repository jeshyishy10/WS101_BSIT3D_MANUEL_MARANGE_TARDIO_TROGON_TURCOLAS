package com.uep.lostfound.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UserProfileUpdateDTO {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String studentYear;
    private String section;
    private String gender;
    private String bio;
    private String department;
    private String course;
    private String emergencyContact;
    private String emergencyPhone;
    private String address;
    private String profileVisibility;
    private boolean emailNotifications;
    private boolean smsNotifications;
    private boolean showContactInfo;
    private MultipartFile profileImageFile;
    private String currentPassword;
    private String newPassword;
    private String confirmPassword;
}