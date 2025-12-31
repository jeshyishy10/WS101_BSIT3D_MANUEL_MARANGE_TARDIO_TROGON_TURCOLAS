package lk.ijse.cmjd108.LostAndFoundSystem.dao;

import lk.ijse.cmjd108.LostAndFoundSystem.dto.ItemStatus;
import lk.ijse.cmjd108.LostAndFoundSystem.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ItemDao extends JpaRepository<Item, String> {

    @Query("SELECT i.status FROM Item i WHERE i.itemId = :itemId")
    String findStatusByItemId(@Param("itemId") String itemId);

    @Modifying
    @Transactional
    @Query("UPDATE Item i SET i.status = :updatedItemStatus WHERE i.itemId = :itemId")
    int updateItemStatus(@Param("itemId") String itemId, @Param("updatedItemStatus") ItemStatus updatedItemStatus);


}
