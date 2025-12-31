package lk.ijse.cmjd108.LostAndFoundSystem.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lk.ijse.cmjd108.LostAndFoundSystem.dto.RequestStatus;
import lk.ijse.cmjd108.LostAndFoundSystem.dto.Role;
import lombok.*;

import java.sql.Time;
import java.time.LocalDate;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Getter
@Setter

public class Request {
    @Id
    private String requestId;

    @ManyToOne
    @JoinColumn(name = "itemId", nullable = false)
    private Item item;

    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    private RequestStatus status;
    private LocalDate requestDate;
    private Time requestTime;
    private LocalDate approvedDate;

}
