package lk.ijse.cmjd108.LostAndFoundSystem.controller;

import lk.ijse.cmjd108.LostAndFoundSystem.dto.ItemDTO;
import lk.ijse.cmjd108.LostAndFoundSystem.dto.RequestDTO;
import lk.ijse.cmjd108.LostAndFoundSystem.dto.UserDTO;
import lk.ijse.cmjd108.LostAndFoundSystem.exception.ItemAlreadyClaimedException;
import lk.ijse.cmjd108.LostAndFoundSystem.exception.RequestAlreadyApprovedException;
import lk.ijse.cmjd108.LostAndFoundSystem.exception.RequestNotFoundException;
import lk.ijse.cmjd108.LostAndFoundSystem.exception.UserNotFoundException;
import lk.ijse.cmjd108.LostAndFoundSystem.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/LostAndFoundSystem/Request")
public class RequestController {

    @Autowired
    private RequestService requestService;

    @PostMapping("/adminUserStaff")
    private ResponseEntity<Void> addRequest (@RequestBody RequestDTO requestDTO){
        if(requestDTO == null){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        try{
            requestService.addRequest(requestDTO);
            return new ResponseEntity<>(HttpStatus.CREATED);
        }
        catch (ItemAlreadyClaimedException e){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        catch (Exception e){
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/admin/{requestId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<RequestDTO> approveRequest(@PathVariable String requestId, @RequestBody RequestDTO requestDTO){
        if(requestDTO == null || requestId == null){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        try{
            requestService.approveRequest(requestId, requestDTO);
            return ResponseEntity.noContent().build();
        }
        catch (RequestAlreadyApprovedException e){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        catch (Exception e){
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/admin/reject/{requestId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<RequestDTO> rejectRequest(@PathVariable String requestId, @RequestBody RequestDTO requestDTO){
        if(requestDTO == null || requestId == null){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        try{
            requestService.rejectRequest(requestId, requestDTO);
            return ResponseEntity.noContent().build();
        }
        catch (RequestAlreadyApprovedException e){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        catch (Exception e){
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/admin")
    public ResponseEntity<List<RequestDTO>> getAllRequests(){
        return ResponseEntity.ok(requestService.getAllRequests());
    }

    @GetMapping("/admin/{requestId}")
    public ResponseEntity<RequestDTO> getRequestById(@PathVariable String requestId){
        return ResponseEntity.ok(requestService.getRequestById(requestId));
    }

    @DeleteMapping("/admin/{requestId}")
    public ResponseEntity<Void> deleteRequest(@PathVariable String requestId){
        if(requestId == null){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        try{
            requestService.deleteRequest(requestId);
            return ResponseEntity.noContent().build();
        }
        catch (RequestNotFoundException e){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
