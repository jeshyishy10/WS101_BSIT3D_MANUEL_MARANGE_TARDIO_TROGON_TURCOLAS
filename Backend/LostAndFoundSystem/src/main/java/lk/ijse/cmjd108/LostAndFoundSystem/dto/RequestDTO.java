package lk.ijse.cmjd108.LostAndFoundSystem.dto;

import lombok.*;

import java.sql.Time;
import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Getter
@Setter

public class RequestDTO {
    private String requestId;
    private String item;
    private String user;
    private RequestStatus status;
    private LocalDate requestDate;
    private Time requestTime;
    private LocalDate approvedDate;

}
