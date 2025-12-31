package lk.ijse.cmjd108.LostAndFoundSystem.service;

import lk.ijse.cmjd108.LostAndFoundSystem.dto.RequestDTO;

import java.util.List;

public interface RequestService {
    void addRequest(RequestDTO requestDTO);

    void approveRequest(String requestId, RequestDTO requestDTO);

    void rejectRequest(String requestId, RequestDTO requestDTO);

    List<RequestDTO> getAllRequests();

    RequestDTO getRequestById(String requestId);

    void deleteRequest(String requestId);
}
