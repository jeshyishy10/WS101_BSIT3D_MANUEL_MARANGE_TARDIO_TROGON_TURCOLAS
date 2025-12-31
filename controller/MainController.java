package com.uep.lostfound.controller;

import com.uep.lostfound.model.Item;
import com.uep.lostfound.model.User;
import com.uep.lostfound.model.Notification;
import com.uep.lostfound.enums.ItemStatus;
import com.uep.lostfound.enums.ItemType;
import com.uep.lostfound.enums.Role;
import com.uep.lostfound.enums.NotificationType;
import com.uep.lostfound.service.ItemService;
import com.uep.lostfound.service.UserService;
import com.uep.lostfound.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class MainController {

    private final ItemService itemService;
    private final UserService userService;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder; // Add this line

    @GetMapping("/")
    public String home() {
        return "index";
    }

    @GetMapping("/login")
    public String login(@RequestParam(value = "error", required = false) String error,
                        @RequestParam(value = "logout", required = false) String logout,
                        @RequestParam(value = "registered", required = false) String registered,
                        Model model) {
        if (error != null) {
            model.addAttribute("error", "Invalid email or password!");
        }
        if (logout != null) {
            model.addAttribute("message", "You have been logged out successfully.");
        }
        if (registered != null) {
            model.addAttribute("message", "Registration successful! Please login.");
        }
        return "login";
    }

    @GetMapping("/register")
    public String register(Model model) {
        model.addAttribute("user", new User());
        return "register";
    }

    @PostMapping("/register")
    public String registerUser(@ModelAttribute User user, Model model) {
        if (userService.emailExists(user.getEmail())) {
            model.addAttribute("error", "Email already registered");
            return "register";
        }
        if (user.getUepId() != null && userService.uepIdExists(user.getUepId())) {
            model.addAttribute("error", "UEP ID already registered");
            return "register";
        }

        userService.registerUser(user);
        return "redirect:/login?registered";
    }

    @GetMapping("/access-denied")
    public String accessDenied() {
        return "access-denied";
    }

    // ============ COMMON ROUTES ============

    @GetMapping("/dashboard")
    public String dashboard(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            return "redirect:/admin/dashboard";
        } else {
            return "redirect:/user/dashboard";
        }
    }

    @GetMapping("/logout-confirm")
    public String logoutConfirmationPage(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        if (userDetails != null) {
            String email = userDetails.getUsername();
            User user = userService.getUserByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            model.addAttribute("user", user);
        }
        return "logout";
    }

    // ============ USER ROUTES ============

    @GetMapping("/user/dashboard")
    public String userDashboard(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Item> recentItems = itemService.getRecentItems(10);
        List<Item> userItems = itemService.getItemsByUser(user);
        List<Notification> notifications = notificationService.getUserNotifications(user.getId());
        Long unreadCount = notificationService.getUnreadCount(user.getId());

        long totalReports = userItems.size();
        long approvedItems = userItems.stream()
                .filter(item -> item.getStatus() == ItemStatus.APPROVED)
                .count();
        long claimedItems = userItems.stream()
                .filter(item -> item.getStatus() == ItemStatus.CLAIMED)
                .count();
        long pendingItems = userItems.stream()
                .filter(item -> item.getStatus() == ItemStatus.PENDING)
                .count();

        model.addAttribute("user", user);
        model.addAttribute("items", recentItems);
        model.addAttribute("notifications", notifications);
        model.addAttribute("unreadCount", unreadCount);
        model.addAttribute("totalReports", totalReports);
        model.addAttribute("approvedItems", approvedItems);
        model.addAttribute("claimedItems", claimedItems);
        model.addAttribute("pendingItems", pendingItems);
        model.addAttribute("categories", itemService.getAllCategories());

        return "user/dashboard";
    }

    @GetMapping("/user/profile")
    public String userProfile(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Item> userItems = itemService.getItemsByUser(user);
        long lostItemsCount = userItems.stream()
                .filter(item -> item.getItemType() == ItemType.LOST)
                .count();
        long foundItemsCount = userItems.stream()
                .filter(item -> item.getItemType() == ItemType.FOUND)
                .count();
        long claimedItemsCount = userItems.stream()
                .filter(item -> item.getStatus() == ItemStatus.CLAIMED)
                .count();

        model.addAttribute("user", user);
        model.addAttribute("totalItems", userItems.size());
        model.addAttribute("lostItemsCount", lostItemsCount);
        model.addAttribute("foundItemsCount", foundItemsCount);
        model.addAttribute("claimedItemsCount", claimedItemsCount);
        model.addAttribute("userItems", userItems);

        return "user/profile";
    }

    @GetMapping("/user/my-reports")
    public String myReports(@AuthenticationPrincipal UserDetails userDetails,
                            @RequestParam(value = "status", required = false) ItemStatus status,
                            @RequestParam(value = "type", required = false) ItemType type,
                            Model model) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Item> myItems = itemService.getItemsByUser(user, status, type);

        model.addAttribute("user", user);
        model.addAttribute("items", myItems);
        model.addAttribute("status", status);
        model.addAttribute("type", type);
        model.addAttribute("statuses", ItemStatus.values());
        model.addAttribute("itemTypes", ItemType.values());
        return "user/my-reports";
    }

    @GetMapping("/user/report-lost")
    public String reportLostItem(Model model, @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        model.addAttribute("user", user);
        model.addAttribute("item", new Item());
        model.addAttribute("categories", itemService.getAllCategories());
        return "user/report-lost";
    }

    @PostMapping("/user/report-lost")
    public String submitLostItem(@ModelAttribute Item item,
                                 @RequestParam(value = "image", required = false) MultipartFile image,
                                 @AuthenticationPrincipal UserDetails userDetails,
                                 RedirectAttributes redirectAttributes) throws IOException {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        item.setItemType(ItemType.LOST);
        item.setDateLost(LocalDate.now());
        item.setStatus(ItemStatus.PENDING);

        if (image != null && !image.isEmpty()) {
            String imageUrl = itemService.saveImage(image);
            item.setImageUrl(imageUrl);
        }

        itemService.reportItem(item, user);
        redirectAttributes.addFlashAttribute("success", "Lost item reported successfully!");
        return "redirect:/user/dashboard";
    }

    @GetMapping("/user/report-found")
    public String reportFoundItem(Model model, @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        model.addAttribute("user", user);
        model.addAttribute("item", new Item());
        model.addAttribute("categories", itemService.getAllCategories());
        return "user/report-found";
    }

    @PostMapping("/user/report-found")
    public String submitFoundItem(@ModelAttribute Item item,
                                  @RequestParam(value = "image", required = false) MultipartFile image,
                                  @AuthenticationPrincipal UserDetails userDetails,
                                  RedirectAttributes redirectAttributes) throws IOException {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        item.setItemType(ItemType.FOUND);
        item.setDateFound(LocalDate.now());
        item.setStatus(ItemStatus.PENDING);

        if (image != null && !image.isEmpty()) {
            String imageUrl = itemService.saveImage(image);
            item.setImageUrl(imageUrl);
        }

        itemService.reportItem(item, user);
        redirectAttributes.addFlashAttribute("success", "Found item reported successfully!");
        return "redirect:/user/dashboard";
    }

    @GetMapping("/user/search")
    public String searchItems(@RequestParam(required = false) String keyword,
                              @RequestParam(required = false) String category,
                              @RequestParam(required = false) ItemType itemType,
                              @RequestParam(required = false) ItemStatus status,
                              @RequestParam(required = false) String date,
                              @AuthenticationPrincipal UserDetails userDetails,
                              Model model) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Item> results = itemService.searchItems(keyword, category, itemType, status, date);

        model.addAttribute("user", user);
        model.addAttribute("results", results);
        model.addAttribute("keyword", keyword);
        model.addAttribute("category", category);
        model.addAttribute("itemType", itemType);
        model.addAttribute("status", status);
        model.addAttribute("date", date);
        model.addAttribute("categories", itemService.getAllCategories());
        model.addAttribute("statuses", ItemStatus.values());
        model.addAttribute("itemTypes", ItemType.values());

        return "user/search";
    }

    @GetMapping("/user/notifications")
    public String viewNotifications(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationService.getUserNotifications(user.getId());
        Long unreadCount = notificationService.getUnreadCount(user.getId());

        model.addAttribute("user", user);
        model.addAttribute("notifications", notifications);
        model.addAttribute("unreadCount", unreadCount);
        return "user/notifications";
    }

    @PostMapping("/user/notifications/mark-read/{id}")
    public String markNotificationAsRead(@PathVariable Long id,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        notificationService.markAsRead(id);
        return "redirect:/user/notifications";
    }

    @PostMapping("/user/notifications/mark-all-read")
    public String markAllNotificationsAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        notificationService.markAllAsRead(user.getId());
        return "redirect:/user/notifications";
    }

    @GetMapping("/user/items/{id}")
    public String viewItemDetails(@PathVariable Long id,
                                  @AuthenticationPrincipal UserDetails userDetails,
                                  Model model) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Item item = itemService.getItemById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        model.addAttribute("user", user);
        model.addAttribute("item", item);
        return "user/item-details";
    }

    @PostMapping("/user/claim/{id}")
    public String claimItem(@PathVariable Long id,
                            @AuthenticationPrincipal UserDetails userDetails,
                            RedirectAttributes redirectAttributes) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean success = itemService.claimItem(id, user);
        if (success) {
            redirectAttributes.addFlashAttribute("success", "Item claimed successfully!");
        } else {
            redirectAttributes.addFlashAttribute("error", "Unable to claim item. It may have already been claimed.");
        }
        return "redirect:/user/dashboard";
    }

    @GetMapping("/user/profile/edit")
    public String editProfileForm(Model model, @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        model.addAttribute("user", user);
        return "user/edit-profile";
    }

    @PostMapping("/user/profile/update")
    public String updateProfile(@ModelAttribute User updatedUser,
                                @AuthenticationPrincipal UserDetails userDetails,
                                RedirectAttributes redirectAttributes) {
        String email = userDetails.getUsername();
        User currentUser = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        userService.updateUserProfile(currentUser.getId(), updatedUser);
        redirectAttributes.addFlashAttribute("success", "Profile updated successfully!");
        return "redirect:/user/profile";
    }

    @GetMapping("/user/profile/change-password")
    public String changePasswordForm(Model model, @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        model.addAttribute("user", user);
        return "user/change-password";
    }

    @PostMapping("/user/profile/change-password")
    public String changePassword(@RequestParam String currentPassword,
                                 @RequestParam String newPassword,
                                 @RequestParam String confirmPassword,
                                 @AuthenticationPrincipal UserDetails userDetails,
                                 Model model) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!newPassword.equals(confirmPassword)) {
            model.addAttribute("error", "New passwords do not match");
            model.addAttribute("user", user);
            return "user/change-password";
        }

        boolean success = userService.changePassword(user.getId(), currentPassword, newPassword);

        if (success) {
            model.addAttribute("success", "Password changed successfully!");
            return "redirect:/user/profile";
        } else {
            model.addAttribute("error", "Current password is incorrect");
            model.addAttribute("user", user);
            return "user/change-password";
        }
    }

    // ============ ADMIN ROUTES ============

    @GetMapping("/admin/dashboard")
    public String adminDashboard(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ADMIN) {
            return "redirect:/access-denied";
        }

        List<Item> pendingItems = itemService.getPendingItems();
        List<Item> allItems = itemService.getAllItems();
        List<User> allUsers = userService.getAllUsers();
        Long foundCount = itemService.countFoundItems();
        Long lostCount = itemService.countLostItems();
        List<Object[]> categoryStats = itemService.getItemsByCategoryStats();

        model.addAttribute("user", user);
        model.addAttribute("pendingItems", pendingItems);
        model.addAttribute("allItems", allItems);
        model.addAttribute("allUsers", allUsers);
        model.addAttribute("foundCount", foundCount);
        model.addAttribute("lostCount", lostCount);
        model.addAttribute("categoryStats", categoryStats);

        return "admin/dashboard";
    }

    @GetMapping("/admin/items/pending")
    public String pendingItems(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ADMIN) {
            return "redirect:/access-denied";
        }

        List<Item> pendingItems = itemService.getPendingItems();

        model.addAttribute("user", user);
        model.addAttribute("items", pendingItems);
        return "admin/pending-items";
    }

    @PostMapping("/admin/items/approve/{id}")
    public String approveItem(@PathVariable Long id,
                              @RequestParam(required = false) String adminNotes,
                              @AuthenticationPrincipal UserDetails userDetails,
                              RedirectAttributes redirectAttributes) {
        String email = userDetails.getUsername();
        User admin = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (admin.getRole() != Role.ADMIN) {
            return "redirect:/access-denied";
        }

        itemService.updateItemStatus(id, ItemStatus.APPROVED, adminNotes, admin);
        redirectAttributes.addFlashAttribute("success", "Item approved successfully!");
        return "redirect:/admin/items/pending";
    }

    @PostMapping("/admin/items/reject/{id}")
    public String rejectItem(@PathVariable Long id,
                             @RequestParam(required = false) String adminNotes,
                             @AuthenticationPrincipal UserDetails userDetails,
                             RedirectAttributes redirectAttributes) {
        String email = userDetails.getUsername();
        User admin = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (admin.getRole() != Role.ADMIN) {
            return "redirect:/access-denied";
        }

        itemService.updateItemStatus(id, ItemStatus.REJECTED, adminNotes, admin);
        redirectAttributes.addFlashAttribute("success", "Item rejected successfully!");
        return "redirect:/admin/items/pending";
    }

    @GetMapping("/admin/items")
    public String manageItems(@AuthenticationPrincipal UserDetails userDetails,
                              @RequestParam(required = false) String keyword,
                              @RequestParam(required = false) ItemStatus status,
                              @RequestParam(required = false) ItemType type,
                              Model model) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ADMIN) {
            return "redirect:/access-denied";
        }

        List<Item> items = itemService.searchItems(keyword, null, type, status, null);

        model.addAttribute("user", user);
        model.addAttribute("items", items);
        model.addAttribute("keyword", keyword);
        model.addAttribute("status", status);
        model.addAttribute("type", type);
        model.addAttribute("statuses", ItemStatus.values());
        model.addAttribute("itemTypes", ItemType.values());
        return "admin/manage-items";
    }

    @GetMapping("/admin/items/{id}")
    public String adminViewItem(@PathVariable Long id,
                                @AuthenticationPrincipal UserDetails userDetails,
                                Model model) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ADMIN) {
            return "redirect:/access-denied";
        }

        Item item = itemService.getItemById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        model.addAttribute("user", user);
        model.addAttribute("item", item);
        return "admin/item-details";
    }

    @GetMapping("/admin/users")
    public String manageUsers(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ADMIN) {
            return "redirect:/access-denied";
        }

        List<User> allUsers = userService.getAllUsers();

        model.addAttribute("user", user);
        model.addAttribute("users", allUsers);
        return "admin/manage-users";
    }

    @PostMapping("/admin/users/toggle-block/{id}")
    public String toggleBlockUser(@PathVariable Long id,
                                  @AuthenticationPrincipal UserDetails userDetails,
                                  RedirectAttributes redirectAttributes) {
        String email = userDetails.getUsername();
        User admin = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (admin.getRole() != Role.ADMIN) {
            return "redirect:/access-denied";
        }

        userService.toggleBlockUser(id);
        redirectAttributes.addFlashAttribute("success", "User status updated successfully!");
        return "redirect:/admin/users";
    }

    @PostMapping("/admin/users/delete/{id}")
    public String deleteUser(@PathVariable Long id,
                             @AuthenticationPrincipal UserDetails userDetails,
                             RedirectAttributes redirectAttributes) {
        String email = userDetails.getUsername();
        User admin = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (admin.getRole() != Role.ADMIN) {
            return "redirect:/access-denied";
        }

        userService.deleteUser(id);
        redirectAttributes.addFlashAttribute("success", "User deleted successfully!");
        return "redirect:/admin/users";
    }

    @GetMapping("/admin/users/{id}")
    public String viewUserDetails(@PathVariable Long id,
                                  @AuthenticationPrincipal UserDetails userDetails,
                                  Model model) {
        String email = userDetails.getUsername();
        User admin = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (admin.getRole() != Role.ADMIN) {
            return "redirect:/access-denied";
        }

        User user = userService.getUserById(id);
        List<Item> userItems = itemService.getItemsByUser(user);

        model.addAttribute("admin", admin);
        model.addAttribute("user", user);
        model.addAttribute("userItems", userItems);
        return "admin/user-details";
    }

    @GetMapping("/admin/reports")
    public String generateReports(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ADMIN) {
            return "redirect:/access-denied";
        }

        List<Item> recentItems = itemService.getRecentItems(50);
        List<User> recentUsers = userService.getRecentUsers(20);
        Long totalUsers = userService.countAllUsers();
        Long activeUsers = userService.countActiveUsers();

        model.addAttribute("user", user);
        model.addAttribute("recentItems", recentItems);
        model.addAttribute("recentUsers", recentUsers);
        model.addAttribute("totalUsers", totalUsers);
        model.addAttribute("activeUsers", activeUsers);
        return "admin/reports";
    }

    @GetMapping("/admin/statistics")
    public String viewStatistics(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ADMIN) {
            return "redirect:/access-denied";
        }

        Long foundCount = itemService.countFoundItems();
        Long lostCount = itemService.countLostItems();
        Long pendingCount = itemService.countPendingItems();
        Long claimedCount = itemService.countClaimedItems();
        List<Object[]> categoryStats = itemService.getItemsByCategoryStats();

        model.addAttribute("user", user);
        model.addAttribute("foundCount", foundCount);
        model.addAttribute("lostCount", lostCount);
        model.addAttribute("pendingCount", pendingCount);
        model.addAttribute("claimedCount", claimedCount);
        model.addAttribute("categoryStats", categoryStats);

        return "admin/statistics";
    }

    @GetMapping("/admin/profile")
    public String adminProfile(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ADMIN) {
            return "redirect:/access-denied";
        }

        model.addAttribute("user", user);
        return "admin/profile";
    }

    @GetMapping("/admin/settings")
    public String adminSettings(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ADMIN) {
            return "redirect:/access-denied";
        }

        model.addAttribute("user", user);
        return "admin/settings";
    }


    // ============ HELP & SUPPORT ============

    @GetMapping("/user/help")
    public String helpPage(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        model.addAttribute("user", user);
        return "user/help";
    }

    @GetMapping("/user/settings")
    public String userSettings(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        model.addAttribute("user", user);
        return "user/settings";
    }
// ============ TEST ENDPOINTS ============

    @GetMapping("/test-encoder")
    @ResponseBody
    public String testPasswordEncoder() {
        try {
            String rawPassword = "test123";
            String encoded = passwordEncoder.encode(rawPassword);

            return "<h3>PasswordEncoder Test</h3>" +
                    "Raw password: " + rawPassword + "<br>" +
                    "Encoded password: " + encoded + "<br>" +
                    "Matches test: " + passwordEncoder.matches(rawPassword, encoded) + "<br>" +
                    "<a href='/'>Back to Home</a>";
        } catch (Exception e) {
            return "PasswordEncoder error: " + e.getMessage() + "<br>" +
                    "Make sure PasswordEncoder bean is configured in SecurityConfig";
        }
    }

    @GetMapping("/test-repo")
    @ResponseBody
    public String testRepository() {
        try {
            long count = userService.countAllUsers();
            return "<h3>UserRepository Test</h3>" +
                    "Total users in database: " + count + "<br>" +
                    "<a href='/create-test-user'>Create Test User</a><br>" +
                    "<a href='/'>Back to Home</a>";
        } catch (Exception e) {
            return "UserRepository error: " + e.getMessage();
        }
    }

    @GetMapping("/create-test-user")
    @ResponseBody
    public String createTestUser() {
        try {
            User user = new User();
            user.setEmail("auto" + System.currentTimeMillis() + "@test.com");
            user.setPassword("test123");
            user.setFirstName("Auto");
            user.setLastName("Generated");
            user.setUepId("AUTO" + System.currentTimeMillis());
            user.setPhoneNumber("1234567890");
            user.setDepartment("Test");

            User saved = userService.registerUser(user);
            return "<h3>Test User Created!</h3>" +
                    "User ID: " + saved.getId() + "<br>" +
                    "Email: " + saved.getEmail() + "<br>" +
                    "First Name: " + saved.getFirstName() + "<br>" +
                    "Last Name: " + saved.getLastName() + "<br>" +
                    "<a href='/test-repo'>Check Total Users</a><br>" +
                    "<a href='/'>Back to Home</a>";
        } catch (Exception e) {
            return "<h3>Error Creating Test User</h3>" +
                    "Error: " + e.getMessage() + "<br>" +
                    "Stack: " + Arrays.toString(e.getStackTrace());
        }
    }

    @GetMapping("/debug/db")
    @ResponseBody
    public String debugDatabase() {
        try {
            // Try direct database operations
            List<User> allUsers = userService.getAllUsers();

            StringBuilder result = new StringBuilder();
            result.append("<h3>Database Debug</h3>");
            result.append("Total users: ").append(allUsers.size()).append("<br><br>");

            if (allUsers.isEmpty()) {
                result.append("No users found in database.<br>");
            } else {
                result.append("Users in database:<br>");
                for (User user : allUsers) {
                    result.append("- ID: ").append(user.getId())
                            .append(" | Email: ").append(user.getEmail())
                            .append(" | Name: ").append(user.getFirstName())
                            .append(" ").append(user.getLastName())
                            .append("<br>");
                }
            }

            result.append("<br><a href='/create-test-user'>Create Test User</a><br>");
            result.append("<a href='/'>Back to Home</a>");

            return result.toString();
        } catch (Exception e) {
            return "Database debug error: " + e.getMessage();
        }
    }
    @GetMapping("/ping")
    @ResponseBody
    public String ping() {
        return "Server is running at: " + System.currentTimeMillis();
    }
}