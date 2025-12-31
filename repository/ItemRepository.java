package com.uep.lostfound.repository;

import com.uep.lostfound.model.Item;
import com.uep.lostfound.model.User;
import com.uep.lostfound.enums.ItemStatus;
import com.uep.lostfound.enums.ItemType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findAllByOrderByCreatedAtDesc();
    List<Item> findByStatus(ItemStatus status);
    List<Item> findByItemType(ItemType itemType);
    List<Item> findByReportedBy(User user);
    List<Item> findByReportedByAndStatus(User user, ItemStatus status);
    List<Item> findByReportedByAndItemType(User user, ItemType itemType);
    List<Item> findByReportedByAndItemTypeAndStatus(User user, ItemType itemType, ItemStatus status);
    List<Item> findByCategory(String category);
    List<Item> findByIsUrgentTrue();
    List<Item> findByItemTypeAndStatus(ItemType itemType, ItemStatus status);

    Long countByItemType(ItemType itemType);
    Long countByStatus(ItemStatus status);

    @Query("SELECT i FROM Item i ORDER BY i.createdAt DESC")
    List<Item> findTopNByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT i FROM Item i WHERE " +
            "(:keyword IS NULL OR i.itemName LIKE %:keyword% OR i.description LIKE %:keyword%) AND " +
            "(:category IS NULL OR i.category = :category) AND " +
            "(:itemType IS NULL OR i.itemType = :itemType) AND " +
            "(:status IS NULL OR i.status = :status)")
    List<Item> searchItems(@Param("keyword") String keyword,
                           @Param("category") String category,
                           @Param("itemType") ItemType itemType,
                           @Param("status") ItemStatus status);

    @Query("SELECT i FROM Item i WHERE i.itemName LIKE %:keyword% OR i.description LIKE %:keyword%")
    List<Item> searchItems(@Param("keyword") String keyword);

    @Query("SELECT i.category, COUNT(i) FROM Item i GROUP BY i.category")
    List<Object[]> getItemsByCategory();

    @Query("SELECT i FROM Item i WHERE i.createdAt BETWEEN :startDate AND :endDate")
    List<Item> findByDateRange(@Param("startDate") LocalDate startDate,
                               @Param("endDate") LocalDate endDate);

    @Query("SELECT i FROM Item i WHERE i.itemType = 'FOUND' AND i.status = 'APPROVED'")
    List<Item> findUnclaimedFoundItems();

    @Query("SELECT i FROM Item i WHERE i.itemType = 'LOST' AND i.status IN ('PENDING', 'APPROVED')")
    List<Item> findActiveLostItems();
}