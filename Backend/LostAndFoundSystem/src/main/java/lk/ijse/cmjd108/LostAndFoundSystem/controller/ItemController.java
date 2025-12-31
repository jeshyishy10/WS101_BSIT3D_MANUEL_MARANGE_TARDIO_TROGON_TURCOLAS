package lk.ijse.cmjd108.LostAndFoundSystem.controller;

import lk.ijse.cmjd108.LostAndFoundSystem.dto.ItemDTO;
import lk.ijse.cmjd108.LostAndFoundSystem.dto.UserDTO;
import lk.ijse.cmjd108.LostAndFoundSystem.exception.ItemNotFoundException;
import lk.ijse.cmjd108.LostAndFoundSystem.exception.UserNotFoundException;
import lk.ijse.cmjd108.LostAndFoundSystem.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/LostAndFoundSystem/Item")

public class ItemController {
    @Autowired
    private ItemService itemService;

    @PostMapping("/adminUserStaff/{userId}")
    private ResponseEntity<Void> addItem (@PathVariable String userId, @RequestBody ItemDTO itemDTO){
        if(itemDTO == null){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        try{
            itemService.addItem(itemDTO, userId);
            return new ResponseEntity<>(HttpStatus.CREATED);
        }
        catch (Exception e){
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/adminUserStaff/{itemId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ItemDTO> updateItemDetails (@PathVariable String itemId, @RequestBody ItemDTO itemDTO){
        if(itemDTO == null || itemId == null){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        try{
            itemService.updateItemDetails(itemId, itemDTO);
            return ResponseEntity.noContent().build();
        }
        catch (ItemNotFoundException e){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        catch (Exception e){
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/adminUserStaff")
    public ResponseEntity<List<ItemDTO>> getAllItems(){
        return ResponseEntity.ok(itemService.getAllItems());
    }

    @GetMapping("/adminUserStaff/{itemId}")
    public ResponseEntity<ItemDTO> getItemById(@PathVariable String itemId){
        return ResponseEntity.ok(itemService.getItemById(itemId));
    }

    @DeleteMapping("/adminUserStaff/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable String itemId){
        if(itemId == null){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        try{
            itemService.deleteItem(itemId);
            return ResponseEntity.noContent().build();
        }
        catch (ItemNotFoundException e){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
