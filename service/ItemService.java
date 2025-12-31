package com.uep.lostfound.service;

import com.uep.lostfound.model.Item;
import com.uep.lostfound.model.User;
import com.uep.lostfound.enums.ItemStatus;
import com.uep.lostfound.enums.ItemType;
import com.uep.lostfound.enums.NotificationType;
import com.uep.lostfound.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final NotificationService notificationService;
    private final String uploadDir = "uploads/items/";

    // Method to report an item
    public Item reportItem(Item item, User reporter) {
        item.setReportedBy(reporter);
        item.setStatus(ItemStatus.PENDING);
        item.setCreatedAt(LocalDateTime.now());
        Item savedItem = itemRepository.save(item);

        // Send notification to admin about new item
        notificationService.createNotificationForAdmins(
                "New Item Reported",
                String.format("New %s item '%s' reported by %s",
                        item.getItemType().toString().toLowerCase(),
                        item.getItemName(),
                        reporter.getFullName()),
                NotificationType.NEW_ITEM
        );

        return savedItem;
    }

    // Method to update item status (admin action)
    public Item updateItemStatus(Long itemId, ItemStatus status, String adminNotes, User admin) {
        Item item = itemRepository.findById(itemId).orElseThrow(() ->
                new RuntimeException("Item not found with id: " + itemId));

        item.setStatus(status);
        item.setAdminNotes(adminNotes);
        item.setReviewedBy(admin);
        item.setReviewedAt(LocalDateTime.now());

        Item updatedItem = itemRepository.save(item);

        // Send notification to reporter
        if (item.getReportedBy() != null) {
            String message = String.format("Your %s item '%s' has been %s by admin.",
                    item.getItemType().toString().toLowerCase(),
                    item.getItemName(),
                    status.toString().toLowerCase());

            NotificationType notificationType = status == ItemStatus.APPROVED ?
                    NotificationType.ITEM_APPROVED : NotificationType.ITEM_REJECTED;

            notificationService.createNotification(
                    item.getReportedBy(),
                    "Item Status Updated",
                    message,
                    notificationType
            );
        }

        return updatedItem;
    }

    // Method to claim an item
    public boolean claimItem(Long itemId, User claimant) {
        Item item = itemRepository.findById(itemId).orElseThrow(() ->
                new RuntimeException("Item not found with id: " + itemId));

        // Check if item is approved and not already claimed
        if (item.getStatus() != ItemStatus.APPROVED) {
            return false;
        }

        item.setStatus(ItemStatus.CLAIMED);
        item.setClaimedBy(claimant);
        item.setClaimedAt(LocalDateTime.now());

        itemRepository.save(item);

        // Notify admin and reporter
        if (item.getReportedBy() != null) {
            notificationService.createNotification(
                    item.getReportedBy(),
                    "Item Claimed",
                    String.format("Your reported item '%s' has been claimed by %s.",
                            item.getItemName(), claimant.getFullName()),
                    NotificationType.ITEM_CLAIMED
            );
        }

        // Notify admin
        notificationService.createNotificationForAdmins(
                "Item Claimed",
                String.format("Item '%s' has been claimed by %s",
                        item.getItemName(),
                        claimant.getFullName()),
                NotificationType.ITEM_CLAIMED
        );

        return true;
    }

    // Get all items sorted by createdAt desc
    public List<Item> getAllItems() {
        return itemRepository.findAllByOrderByCreatedAtDesc();
    }

    // Get pending items
    public List<Item> getPendingItems() {
        return itemRepository.findByStatus(ItemStatus.PENDING);
    }

    // Get approved items
    public List<Item> getApprovedItems() {
        return itemRepository.findByStatus(ItemStatus.APPROVED);
    }

    // Get items by user
    public List<Item> getItemsByUser(User user) {
        return itemRepository.findByReportedBy(user);
    }

    // Get items by user with filters
    public List<Item> getItemsByUser(User user, ItemStatus status, ItemType type) {
        if (status != null && type != null) {
            return itemRepository.findByReportedByAndItemTypeAndStatus(user, type, status);
        } else if (status != null) {
            return itemRepository.findByReportedByAndStatus(user, status);
        } else if (type != null) {
            return itemRepository.findByReportedByAndItemType(user, type);
        } else {
            return itemRepository.findByReportedBy(user);
        }
    }

    // Search items with multiple criteria
    public List<Item> searchItems(String keyword, String category, ItemType itemType, ItemStatus status, String date) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            return itemRepository.searchItems(keyword, category, itemType, status);
        } else if (category != null || itemType != null || status != null) {
            return itemRepository.searchItems("", category, itemType, status);
        } else {
            return itemRepository.findAllByOrderByCreatedAtDesc();
        }
    }

    // Search items (simple keyword search)
    public List<Item> searchItems(String keyword) {
        return itemRepository.searchItems(keyword);
    }

    // Get items by category
    public List<Item> getItemsByCategory(String category) {
        return itemRepository.findByCategory(category);
    }

    // Get urgent items
    public List<Item> getUrgentItems() {
        return itemRepository.findByIsUrgentTrue();
    }

    // Save image file
    public String saveImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID().toString() + fileExtension;
        Path filePath = uploadPath.resolve(fileName);

        // Save file
        Files.copy(file.getInputStream(), filePath);

        return "/uploads/items/" + fileName;
    }

    // Count found items
    public Long countFoundItems() {
        return itemRepository.countByItemType(ItemType.FOUND);
    }

    // Count lost items
    public Long countLostItems() {
        return itemRepository.countByItemType(ItemType.LOST);
    }

    // Count pending items
    public Long countPendingItems() {
        return itemRepository.countByStatus(ItemStatus.PENDING);
    }

    // Count claimed items
    public Long countClaimedItems() {
        return itemRepository.countByStatus(ItemStatus.CLAIMED);
    }

    // Get category statistics
    public List<Object[]> getItemsByCategoryStats() {
        return itemRepository.getItemsByCategory();
    }

    // Get daily report statistics (stub method)
    public List<Object[]> getDailyReportStats(int days) {
        // Return empty list for now - implement this if needed
        return List.of();
    }

    // Get recent items with limit
    public List<Item> getRecentItems(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        return itemRepository.findTopNByOrderByCreatedAtDesc(pageable);
    }

    // Get item by ID
    public Optional<Item> getItemById(Long id) {
        return itemRepository.findById(id);
    }

    // Get found items
    public List<Item> getFoundItems() {
        return itemRepository.findByItemType(ItemType.FOUND);
    }

    // Get lost items
    public List<Item> getLostItems() {
        return itemRepository.findByItemType(ItemType.LOST);
    }

    // Get items by status
    public List<Item> getItemsByStatus(ItemStatus status) {
        return itemRepository.findByStatus(status);
    }

    // Get items by type and status
    public List<Item> getItemsByTypeAndStatus(ItemType itemType, ItemStatus status) {
        return itemRepository.findByItemTypeAndStatus(itemType, status);
    }

    // Get total items count
    public long getTotalItemsCount() {
        return itemRepository.count();
    }

    // Delete item
    public void deleteItem(Long id) {
        itemRepository.deleteById(id);
    }

    // Update item
    public Item updateItem(Long id, Item itemDetails) {
        Item item = getItemById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        item.setItemName(itemDetails.getItemName());
        item.setDescription(itemDetails.getDescription());
        item.setCategory(itemDetails.getCategory());
        item.setUrgent(itemDetails.isUrgent());

        // Update location based on item type
        if (item.getItemType() == ItemType.FOUND) {
            item.setLocationFound(itemDetails.getLocationFound());
            if (itemDetails.getDateFound() != null) {
                item.setDateFound(itemDetails.getDateFound());
            }
        } else if (item.getItemType() == ItemType.LOST) {
            item.setLocationLost(itemDetails.getLocationLost());
            if (itemDetails.getDateLost() != null) {
                item.setDateLost(itemDetails.getDateLost());
            }
        }

        // Update image if provided
        if (itemDetails.getImageUrl() != null && !itemDetails.getImageUrl().isEmpty()) {
            item.setImageUrl(itemDetails.getImageUrl());
        }

        item.setUpdatedAt(LocalDateTime.now());
        return itemRepository.save(item);
    }

    // Get item location based on type
    public String getItemLocation(Item item) {
        if (item.getItemType() == ItemType.FOUND) {
            return item.getLocationFound();
        } else if (item.getItemType() == ItemType.LOST) {
            return item.getLocationLost();
        }
        return null;
    }

    // Get all available categories
    public List<String> getAllCategories() {
        return Arrays.asList(
                "Electronics",
                "Documents",
                "Accessories",
                "Books",
                "Clothing",
                "Wallets & Purses",
                "Keys",
                "Stationery",
                "Sports Equipment",
                "Musical Instruments",
                "Jewelry",
                "Eyewear",
                "Bags & Backpacks",
                "ID Cards",
                "Other"
        );
    }

    // Get items by date range
    public List<Item> getItemsByDateRange(LocalDate startDate, LocalDate endDate) {
        return itemRepository.findByDateRange(startDate, endDate);
    }

    // Get unclaimed found items
    public List<Item> getUnclaimedFoundItems() {
        return itemRepository.findUnclaimedFoundItems();
    }

    // Get active lost items (not claimed)
    public List<Item> getActiveLostItems() {
        return itemRepository.findActiveLostItems();
    }

    // Get dashboard statistics
    public Map<String, Long> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalItems", getTotalItemsCount());
        stats.put("foundItems", countFoundItems());
        stats.put("lostItems", countLostItems());
        stats.put("pendingItems", countPendingItems());
        stats.put("claimedItems", countClaimedItems());
        return stats;
    }
}