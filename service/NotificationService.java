package com.uep.lostfound.service;

import com.uep.lostfound.model.Notification;
import com.uep.lostfound.model.User;
import com.uep.lostfound.enums.NotificationType;
import com.uep.lostfound.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    // Create notification for a specific user
    public Notification createNotification(User recipient, String title, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .recipient(recipient)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        return notificationRepository.save(notification);
    }

    // Create notification for admins
    public void createNotificationForAdmins(String title, String message, NotificationType type) {
        List<User> admins = userService.getAllAdmins();
        for (User admin : admins) {
            createNotification(admin, title, message, type);
        }
    }

    // Get user notifications
    public List<Notification> getUserNotifications(Long userId) {
        User user = userService.getUserById(userId);
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
    }

    // Get unread count for user - ADD THIS METHOD
    public Long getUnreadCount(Long userId) {
        User user = userService.getUserById(userId);
        return notificationRepository.countByRecipientAndIsReadFalse(user);
    }

    // Mark notification as read
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    // Mark all notifications as read for user
    public void markAllAsRead(Long userId) {
        User user = userService.getUserById(userId);
        List<Notification> unreadNotifications = notificationRepository.findByRecipientAndIsReadFalse(user);
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    // Get unread notifications for user
    public List<Notification> getUnreadNotifications(Long userId) {
        User user = userService.getUserById(userId);
        return notificationRepository.findByRecipientAndIsReadFalseOrderByCreatedAtDesc(user);
    }

    // Delete notification
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    // Delete all notifications for user
    public void deleteAllNotifications(Long userId) {
        User user = userService.getUserById(userId);
        notificationRepository.deleteByRecipient(user);
    }
}