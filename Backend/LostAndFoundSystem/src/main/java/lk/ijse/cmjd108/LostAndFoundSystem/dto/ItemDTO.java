package lk.ijse.cmjd108.LostAndFoundSystem.dto;

import lombok.*;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Getter
@Setter

public class ItemDTO {
    private String itemId;
    private String itemName;
    private String description;
    private String location;
    private ItemStatus status;
    private LocalDate reportedDate;
    private String reportedUser;
}
