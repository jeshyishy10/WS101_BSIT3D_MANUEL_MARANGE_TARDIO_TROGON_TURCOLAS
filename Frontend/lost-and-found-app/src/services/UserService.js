// src/services/UserService.js
// User Service - Re-export from api module
import { authAPI, userAPI } from './api';

const UserService = {
  // Authentication methods
  register: authAPI.register,
  login: authAPI.login,
  logout: authAPI.logout,
  verifyToken: authAPI.verifyToken,
  checkEmail: authAPI.checkEmail,

  // User profile methods
  getProfile: userAPI.getProfile,
  updateProfile: userAPI.updateProfile,
  getUserById: userAPI.getUserById,
  getCurrentUser: userAPI.getCurrentUser,

  // Public user methods
  getAllUsers: userAPI.getAllUsers,

  // Admin methods
  adminGetAllUsers: userAPI.adminGetAllUsers,
  adminGetUser: userAPI.adminGetUser,
  adminUpdateUser: userAPI.adminUpdateUser,
  adminDeleteUser: userAPI.adminDeleteUser
};

export default UserService;