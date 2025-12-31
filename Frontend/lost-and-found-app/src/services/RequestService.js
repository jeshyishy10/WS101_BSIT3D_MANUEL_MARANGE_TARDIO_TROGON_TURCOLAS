// Request Service - Re-export from api module
import { requestAPI } from './api';

const RequestService = {
  // Public methods
  getAllRequests: requestAPI.getAllRequests,
  getRequestById: requestAPI.getRequestById,
  createRequest: requestAPI.createRequest,
  updateRequest: requestAPI.updateRequest,
  deleteRequest: requestAPI.deleteRequest,
  getUserRequests: requestAPI.getUserRequests,
  getItemRequests: requestAPI.getItemRequests,
  updateRequestStatus: requestAPI.updateRequestStatus,

  // Admin methods
  adminGetAllRequests: requestAPI.adminGetAllRequests,
  adminApproveRequest: requestAPI.adminApproveRequest,
  adminRejectRequest: requestAPI.adminRejectRequest,
  adminCreateRequest: requestAPI.adminCreateRequest
};

export default RequestService;