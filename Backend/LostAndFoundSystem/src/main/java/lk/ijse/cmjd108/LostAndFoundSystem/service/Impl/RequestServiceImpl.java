package lk.ijse.cmjd108.LostAndFoundSystem.service.Impl;

import lk.ijse.cmjd108.LostAndFoundSystem.dao.ItemDao;
import lk.ijse.cmjd108.LostAndFoundSystem.dao.RequestDao;
import lk.ijse.cmjd108.LostAndFoundSystem.dao.UserDao;
import lk.ijse.cmjd108.LostAndFoundSystem.dto.ItemStatus;
import lk.ijse.cmjd108.LostAndFoundSystem.dto.RequestDTO;
import lk.ijse.cmjd108.LostAndFoundSystem.dto.RequestStatus;
import lk.ijse.cmjd108.LostAndFoundSystem.entity.Item;
import lk.ijse.cmjd108.LostAndFoundSystem.entity.Request;
import lk.ijse.cmjd108.LostAndFoundSystem.entity.User;
import lk.ijse.cmjd108.LostAndFoundSystem.exception.*;
import lk.ijse.cmjd108.LostAndFoundSystem.service.RequestService;
import lk.ijse.cmjd108.LostAndFoundSystem.util.EntityDtoConversion;
import lk.ijse.cmjd108.LostAndFoundSystem.util.UtilData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RequestServiceImpl implements RequestService {
    @Autowired
    private RequestDao requestDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private ItemDao itemDao;

    @Autowired
    private EntityDtoConversion entityDtoConversion;

    @Override
    public void addRequest(RequestDTO requestDTO) {
        String userId = requestDTO.getUser();
        String itemId = requestDTO.getItem();

        System.out.println("User ID: " + userId);
        System.out.println("Item ID: " + itemId);

        User user = userDao.findById(userId).orElseThrow(() -> new UserNotFoundException("User not found"));
        Item item = itemDao.findById(itemId).orElseThrow(() -> new ItemNotFoundException("Item not found"));

        ItemStatus itemStatus = ItemStatus.valueOf(itemDao.findStatusByItemId(itemId));

        System.out.println("status: " + itemStatus);

        if (itemStatus != ItemStatus.CLAIMED) {
            requestDTO.setRequestId(UtilData.generateRequestId());
            requestDTO.setRequestDate(UtilData.generateToday());
            requestDTO.setRequestTime(UtilData.generateNow());
            requestDTO.setStatus(RequestStatus.valueOf("PENDING"));

            Request newRequest = entityDtoConversion.convertRequestDtoToRequestEntity(requestDTO, user, item);
            requestDao.save(newRequest);
        }

        else{
            throw new ItemAlreadyClaimedException("Item is already claimed");
        }

    }

    @Override
    public void approveRequest(String requestId, RequestDTO requestDTO) {
        Request request = requestDao.findById(requestId).orElseThrow(() ->new RequestNotFoundException("Request not found"));

        RequestStatus requestStatus = request.getStatus();
        System.out.println("RS : " + requestStatus);
        if(requestStatus == RequestStatus.PENDING){
            //set request status to approve
            request.setStatus(RequestStatus.APPROVED);
            System.out.println("RS after : " + request.getStatus());

            //update item status as CLAIMED after approved
            ItemStatus updatedItemStatus = ItemStatus.CLAIMED;
            int updatedRows = itemDao.updateItemStatus(request.getItem().getItemId(), updatedItemStatus);

            request.setApprovedDate(UtilData.generateToday());
        }

        else {
            throw new RequestAlreadyApprovedException("Request already approved or rejected");
        }
    }

    @Override
    public void rejectRequest(String requestId, RequestDTO requestDTO) {
        Request request = requestDao.findById(requestId).orElseThrow(() ->new RequestNotFoundException("Request not found"));
        RequestStatus requestStatus = request.getStatus();

        if(requestStatus == RequestStatus.PENDING) {
            //set request status to rejected
            request.setStatus(RequestStatus.REJECTED);
        }
        else {
            throw new RequestAlreadyApprovedException("Request already approved or rejected");
        }
    }

    @Override
    public List<RequestDTO> getAllRequests() {
        return entityDtoConversion.toRequestDtoList(requestDao.findAll());
    }

    @Override
    public RequestDTO getRequestById(String requestId) {
        Optional<Request>foundRequest = requestDao.findById(requestId);
        if(foundRequest.isPresent()){
            Request selectedRequest = requestDao.getReferenceById(requestId);
            return entityDtoConversion.convertRequestEntityToRequestDto(selectedRequest);
        }
        else{
            throw new RequestNotFoundException("Request not found");
        }
    }

    @Override
    public void deleteRequest(String requestId) {
        Optional<Request>foundRequest = requestDao.findById(requestId);

        if(foundRequest.isPresent()){
            requestDao.deleteById(requestId);
        }
        else{
            throw new RequestNotFoundException("Request not found");
        }
    }


}
