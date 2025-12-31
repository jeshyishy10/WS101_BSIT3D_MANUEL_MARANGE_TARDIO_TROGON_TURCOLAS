package lk.ijse.cmjd108.LostAndFoundSystem.entity;

import jakarta.persistence.*;
import lk.ijse.cmjd108.LostAndFoundSystem.dto.ItemStatus;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Getter
@Setter
public class Item {

    @Id
    private String itemId;
    private String itemName;
    private String description;
    private String location;
    private ItemStatus status;
    private LocalDate reportedDate;

    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Request>requestList;

}
