package lk.ijse.cmjd108.LostAndFoundSystem.service.Impl;

import lk.ijse.cmjd108.LostAndFoundSystem.dao.UserDao;
import lk.ijse.cmjd108.LostAndFoundSystem.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserDao userDao;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userDao.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),           // username
                user.getPassword(),           // password (should be BCrypt encoded)
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole())) // authorities
        );
    }
}