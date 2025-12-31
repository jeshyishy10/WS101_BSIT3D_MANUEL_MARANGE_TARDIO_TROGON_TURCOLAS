package lk.ijse.cmjd108.LostAndFoundSystem.service;

import lk.ijse.cmjd108.LostAndFoundSystem.dto.UserDTO;

import java.util.List;

public interface UserService {

    void addUser(UserDTO userDTO);

    UserDTO login(UserDTO userDTO);

    void updateUserDetails(String userId, UserDTO userDTO);

    List<UserDTO> getAllUsers();

    UserDTO getUserById(String userId);

    void deleteUser(String userId);
}
