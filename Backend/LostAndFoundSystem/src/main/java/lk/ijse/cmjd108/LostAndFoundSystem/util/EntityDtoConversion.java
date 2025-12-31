package lk.ijse.cmjd108.LostAndFoundSystem.util;

import lk.ijse.cmjd108.LostAndFoundSystem.dto.ItemDTO;
import lk.ijse.cmjd108.LostAndFoundSystem.dto.RequestDTO;
import lk.ijse.cmjd108.LostAndFoundSystem.dto.UserDTO;
import lk.ijse.cmjd108.LostAndFoundSystem.entity.Item;
import lk.ijse.cmjd108.LostAndFoundSystem.entity.Request;
import lk.ijse.cmjd108.LostAndFoundSystem.entity.User;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class EntityDtoConversion {
    @Autowired
    private ModelMapper modelMapper;

    //User
    public User convertUserDtoToUserEntity(UserDTO userDTO){
        return modelMapper.map(userDTO, User.class);
    }

    public UserDTO convertUserEntityToUserDto(User user){
        return modelMapper.map(user, UserDTO.class);
    }

    public List<UserDTO> toUserDtoList(List<User> userList){
        return modelMapper.map(userList, new TypeToken<List<UserDTO>>(){}.getType());
    }

    //Item
    public Item convertItemDtoToItemEntity(ItemDTO itemDTO, User user){
        Item item = modelMapper.map(itemDTO, Item.class);
        item.setUser(user);
        return item;
    }

    public ItemDTO convertItemEntityToItemDto(Item item){
        ItemDTO itemDTO = modelMapper.map(item, ItemDTO.class);
        if (item.getUser() != null) {
            itemDTO.setReportedUser(String.valueOf(modelMapper.map(item.getUser().getUserId(), UserDTO.class)));
        }
        return itemDTO;
    }

    public List<ItemDTO> toItemDtoList(List<Item> itemList){
        return itemList.stream().map(entity -> {
            ItemDTO itemDTO = new ItemDTO();
            itemDTO.setItemId(entity.getItemId());

            if (entity.getUser() != null) {
                itemDTO.setReportedUser(entity.getUser().getUserId());
            }

            itemDTO.setItemId(entity.getItemId());
            itemDTO.setItemName(entity.getItemName());
            itemDTO.setDescription(entity.getDescription());
            itemDTO.setLocation(entity.getLocation());
            itemDTO.setReportedDate(entity.getReportedDate());
            itemDTO.setStatus(entity.getStatus());
            return itemDTO;
        }).collect(Collectors.toList());

    }


    //Request
    public Request convertRequestDtoToRequestEntity(RequestDTO requestDTO, User user, Item item){
        Request request = modelMapper.map(requestDTO, Request.class);
        request.setUser(user);
        request.setItem(item);
        return request;
    }

    public RequestDTO convertRequestEntityToRequestDto(Request request){
        RequestDTO requestDTO = modelMapper.map(request, RequestDTO.class);
        if (request.getUser() != null) {
            requestDTO.setUser(String.valueOf(modelMapper.map(request.getUser().getUserId(), UserDTO.class)));
        }
        if (request.getItem() != null) {
            requestDTO.setItem(String.valueOf(modelMapper.map(request.getItem().getItemId(), UserDTO.class)));
        }
        return requestDTO;
    }

    public List<RequestDTO> toRequestDtoList(List<Request> requestList){
        return requestList.stream().map(entity -> {
            RequestDTO requestDTO = new RequestDTO();
            if (entity.getUser() != null) {
                requestDTO.setUser(entity.getUser().getUserId());
            }

            if (entity.getItem() != null) {
                requestDTO.setItem(entity.getItem().getItemId());
            }

            requestDTO.setRequestId(entity.getRequestId());
            requestDTO.setRequestDate(entity.getRequestDate());
            requestDTO.setRequestTime(entity.getRequestTime());
            requestDTO.setStatus(entity.getStatus());
            requestDTO.setApprovedDate(entity.getApprovedDate());
            return requestDTO;
        }).collect(Collectors.toList());

    }

}
