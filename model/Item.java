package com.uep.lostfound.model;

import com.uep.lostfound.enums.ItemStatus;
import com.uep.lostfound.enums.ItemType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false)
    private ItemType itemType;

    private String category;

    @Enumerated(EnumType.STRING)
    private ItemStatus status;

    @Column(name = "location_found")
    private String locationFound;

    @Column(name = "location_lost")
    private String locationLost;

    @Column(name = "date_found")
    private LocalDate dateFound;

    @Column(name = "date_lost")
    private LocalDate dateLost;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "is_urgent")
    private boolean isUrgent;

    @Column(name = "admin_notes")
    private String adminNotes;

    @ManyToOne
    @JoinColumn(name = "reported_by_id")
    private User reportedBy;

    @ManyToOne
    @JoinColumn(name = "reviewed_by_id")
    private User reviewedBy;

    @ManyToOne
    @JoinColumn(name = "claimed_by_id")
    private User claimedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "claimed_at")
    private LocalDateTime claimedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}