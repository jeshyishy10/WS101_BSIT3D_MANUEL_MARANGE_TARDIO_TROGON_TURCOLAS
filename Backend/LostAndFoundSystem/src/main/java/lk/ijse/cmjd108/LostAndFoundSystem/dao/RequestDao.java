package lk.ijse.cmjd108.LostAndFoundSystem.dao;


import lk.ijse.cmjd108.LostAndFoundSystem.entity.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RequestDao extends JpaRepository<Request, String> {

}
