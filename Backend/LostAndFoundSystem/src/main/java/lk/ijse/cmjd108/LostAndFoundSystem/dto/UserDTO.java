package lk.ijse.cmjd108.LostAndFoundSystem.dto;

import lombok.*;

import java.sql.Time;
import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Getter
@Setter

public class UserDTO {
    private String userId;
    private String name;
    private String email;
    private String department;
    private String password;
    private Role role;
    private LocalDate registeredDate;
    private Time registeredTime;
    private String token;
    private String expirationTime;
    private Boolean isLogin;
    private String message;
}
