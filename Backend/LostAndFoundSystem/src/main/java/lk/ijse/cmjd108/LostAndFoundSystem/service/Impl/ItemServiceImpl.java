package lk.ijse.cmjd108.LostAndFoundSystem.service.Impl;

import lk.ijse.cmjd108.LostAndFoundSystem.dao.ItemDao;
import lk.ijse.cmjd108.LostAndFoundSystem.dao.UserDao;
import lk.ijse.cmjd108.LostAndFoundSystem.dto.ItemDTO;
import lk.ijse.cmjd108.LostAndFoundSystem.entity.Item;
import lk.ijse.cmjd108.LostAndFoundSystem.entity.User;
import lk.ijse.cmjd108.LostAndFoundSystem.exception.ItemNotFoundException;
import lk.ijse.cmjd108.LostAndFoundSystem.exception.UserNotFoundException;
import lk.ijse.cmjd108.LostAndFoundSystem.service.ItemService;
import lk.ijse.cmjd108.LostAndFoundSystem.util.EntityDtoConversion;
import lk.ijse.cmjd108.LostAndFoundSystem.util.UtilData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ItemServiceImpl implements ItemService {
    @Autowired
    private ItemDao itemDao;

    @Autowired
    private EntityDtoConversion entityDtoConversion;

    @Autowired
    private UserDao userDao;

    @Override
    public void addItem(ItemDTO itemDTO, String userId) {

        User user = userDao.findById(userId).orElseThrow(() -> new UserNotFoundException("User not found"));

        itemDTO.setItemId(UtilData.generateItemId());
        itemDTO.setReportedDate(UtilData.generateToday());
        itemDTO.setReportedUser(userId);
        Item newItem = entityDtoConversion.convertItemDtoToItemEntity(itemDTO, user);
        itemDao.save(newItem);

    }

    @Override
    public void updateItemDetails(String itemId, ItemDTO itemDTO) {
        Optional<Item> foundItem = itemDao.findById(itemId);

        if(foundItem.isPresent()){
            Item updatedItem = foundItem.get();
            updatedItem.setItemName(itemDTO.getItemName());
            updatedItem.setDescription(itemDTO.getDescription());
            updatedItem.setStatus(itemDTO.getStatus());
            updatedItem.setLocation(itemDTO.getLocation());

            itemDao.save(updatedItem);
        }

        else{
            throw new ItemNotFoundException("Item not found");
        }
    }

    @Override
    public List<ItemDTO> getAllItems() {
        return entityDtoConversion.toItemDtoList(itemDao.findAll());
    }

    @Override
    public ItemDTO getItemById(String itemId) {
        Optional<Item> foundItem = itemDao.findById(itemId);
        if(foundItem.isPresent()){
            Item selectedItem = itemDao.getReferenceById(itemId);
            return entityDtoConversion.convertItemEntityToItemDto(selectedItem);
        }

        else {
            throw new ItemNotFoundException("Item not found");
        }
    }

    @Override
    public void deleteItem(String itemId) {
        Optional<Item> foundItem = itemDao.findById(itemId);
        if(foundItem.isPresent()){
            itemDao.deleteById(itemId);
        }
        else {
            throw new ItemNotFoundException("Item not found");
        }
    }


}
