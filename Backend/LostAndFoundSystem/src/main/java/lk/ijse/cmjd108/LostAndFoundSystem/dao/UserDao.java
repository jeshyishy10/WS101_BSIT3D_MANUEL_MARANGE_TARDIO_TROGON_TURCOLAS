package lk.ijse.cmjd108.LostAndFoundSystem.dao;

import lk.ijse.cmjd108.LostAndFoundSystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserDao extends JpaRepository<User, String> {

    Optional<User> findByEmail(String email);
}
