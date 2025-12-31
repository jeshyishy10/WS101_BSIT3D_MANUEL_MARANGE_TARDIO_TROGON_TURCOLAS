package lk.ijse.cmjd108.LostAndFoundSystem.service.Impl;

import lk.ijse.cmjd108.LostAndFoundSystem.dao.UserDao;
import lk.ijse.cmjd108.LostAndFoundSystem.dto.Role;
import lk.ijse.cmjd108.LostAndFoundSystem.dto.UserDTO;
import lk.ijse.cmjd108.LostAndFoundSystem.entity.User;
import lk.ijse.cmjd108.LostAndFoundSystem.exception.UserNotFoundException;
import lk.ijse.cmjd108.LostAndFoundSystem.service.UserService;
import lk.ijse.cmjd108.LostAndFoundSystem.util.EntityDtoConversion;
import lk.ijse.cmjd108.LostAndFoundSystem.util.JWTUtils;
import lk.ijse.cmjd108.LostAndFoundSystem.util.UtilData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserDao userDao;

    @Autowired
    private EntityDtoConversion entityDtoConversion;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JWTUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    public void addUser(UserDTO userDTO) {
        Optional<User> foundUser = userDao.findByEmail(userDTO.getEmail());

        if(foundUser.isEmpty()){
            userDTO.setUserId(UtilData.generateUserId());
            userDTO.setRegisteredDate(UtilData.generateToday());
            userDTO.setRegisteredTime(UtilData.generateNow());
            userDTO.setPassword(passwordEncoder.encode(userDTO.getPassword()));

            // FIX: Set default role if null
            if (userDTO.getRole() == null) {
                userDTO.setRole(Role.USER);
                System.out.println("INFO: Setting default role USER for: " + userDTO.getEmail());
            }

            User newUser = entityDtoConversion.convertUserDtoToUserEntity(userDTO);
            userDao.save(newUser);

            System.out.println("SUCCESS: User registered: " + userDTO.getEmail() +
                    " with role: " + userDTO.getRole());
        }
        else{
            throw new RuntimeException ("User is already registered!");
        }
    }

    @Override
    public UserDTO login(UserDTO userDTO) {
        UserDTO responseDTO = new UserDTO();
        try {
            // Authenticate user
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            userDTO.getEmail(),
                            userDTO.getPassword()
                    )
            );

            // Get user from database
            User user = userDao.findByEmail(userDTO.getEmail())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            // FIX: Check if user has role, set default if null
            if (user.getRole() == null) {
                user.setRole(Role.USER);
                userDao.save(user);
                System.out.println("WARNING: User " + user.getEmail() + " had null role, set to USER");
            }

            // Generate JWT token
            String jwt = jwtUtils.generateToken(user);

            // Set response
            responseDTO.setUserId(user.getUserId());
            responseDTO.setEmail(user.getEmail());
            responseDTO.setName(user.getName());
            responseDTO.setRole(user.getRole());
            responseDTO.setDepartment(user.getDepartment());
            responseDTO.setRegisteredDate(user.getRegisteredDate());
            responseDTO.setRegisteredTime(user.getRegisteredTime());
            responseDTO.setToken(jwt);
            responseDTO.setExpirationTime("24Hrs");
            responseDTO.setIsLogin(true);
            responseDTO.setMessage("Login Success");

            System.out.println("SUCCESS: User logged in: " + user.getEmail());
            return responseDTO;

        } catch (AuthenticationException e) {
            // Handle authentication failures
            System.out.println("ERROR: Login failed for: " + userDTO.getEmail() + " - " + e.getMessage());
            responseDTO.setIsLogin(false);
            responseDTO.setMessage("Invalid email or password");
            return responseDTO;
        } catch (Exception e) {
            // Handle other exceptions
            e.printStackTrace();
            System.out.println("ERROR: Login exception for: " + userDTO.getEmail() + " - " + e.getMessage());
            responseDTO.setIsLogin(false);
            responseDTO.setMessage("Login failed: " + e.getMessage());
            return responseDTO;
        }
    }

    @Override
    public void updateUserDetails(String userId, UserDTO userDTO) {
        Optional<User> foundUser = userDao.findById(userId);
        if(foundUser.isPresent()){
            User user = foundUser.get();

            // Update only non-null fields
            if (userDTO.getName() != null) {
                user.setName(userDTO.getName());
            }
            if (userDTO.getEmail() != null && !userDTO.getEmail().equals(user.getEmail())) {
                // Check if new email is not already taken
                if (userDao.findByEmail(userDTO.getEmail()).isPresent()) {
                    throw new RuntimeException("Email already in use");
                }
                user.setEmail(userDTO.getEmail());
            }
            if (userDTO.getDepartment() != null) {
                user.setDepartment(userDTO.getDepartment());
            }
            if (userDTO.getRole() != null) {
                user.setRole(userDTO.getRole());
            }

            userDao.save(user);
            System.out.println("SUCCESS: Updated user: " + user.getEmail());
        }
        else {
            throw new UserNotFoundException("User not found");
        }
    }

    @Override
    public List<UserDTO> getAllUsers() {
        List<User> users = userDao.findAll();
        return entityDtoConversion.toUserDtoList(users);
    }

    @Override
    public UserDTO getUserById(String userId) {
        User user = userDao.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return entityDtoConversion.convertUserEntityToUserDto(user);
    }

    @Override
    public void deleteUser(String userId) {
        if (!userDao.existsById(userId)) {
            throw new UserNotFoundException("User not found");
        }
        userDao.deleteById(userId);
        System.out.println("SUCCESS: Deleted user ID: " + userId);
    }
}