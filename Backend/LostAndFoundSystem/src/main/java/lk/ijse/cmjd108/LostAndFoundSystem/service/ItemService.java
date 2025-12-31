package lk.ijse.cmjd108.LostAndFoundSystem.service;

import lk.ijse.cmjd108.LostAndFoundSystem.dto.ItemDTO;
import java.util.List;

public interface ItemService {
    // Existing methods
    void addItem(ItemDTO itemDTO, String userId);

    // Overloaded method without userId
    default ItemDTO addItem(ItemDTO itemDTO) {
        throw new UnsupportedOperationException("Method not implemented");
    }

    void updateItemDetails(String itemId, ItemDTO itemDTO);
    List<ItemDTO> getAllItems();
    ItemDTO getItemById(String itemId);
    void deleteItem(String itemId);

    // New methods for additional functionality
    default List<ItemDTO> getItemsByUserId(String userId) {
        throw new UnsupportedOperationException("Method not implemented");
    }

    default List<ItemDTO> getLostItems() {
        throw new UnsupportedOperationException("Method not implemented");
    }

    default List<ItemDTO> getFoundItems() {
        throw new UnsupportedOperationException("Method not implemented");
    }

    default ItemDTO markAsClaimed(String itemId) {
        throw new UnsupportedOperationException("Method not implemented");
    }

    default List<ItemDTO> searchItems(String query) {
        throw new UnsupportedOperationException("Method not implemented");
    }

    default List<ItemDTO> getItemsByCategory(String category) {
        throw new UnsupportedOperationException("Method not implemented");
    }

    default List<ItemDTO> getItemsByStatus(String status) {
        throw new UnsupportedOperationException("Method not implemented");
    }
}