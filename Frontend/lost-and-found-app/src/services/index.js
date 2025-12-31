// Import the main api for utilities
import api, {
  checkAuth,
  getCurrentUser,
  isAdmin,
  isStaff,
  isUser,
  hasRole,
  setAuthData,
  clearAuthData
} from './api';

// Export services
export { default as ItemService } from './ItemService';
export { default as RequestService } from './RequestService';
export { default as UserService } from './UserService';

// Export all utilities with aliases for consistency
export {
  checkAuth,
  getCurrentUser,
  isAdmin,
  isStaff,
  isUser,
  hasRole,
  setAuthData as setAuth,
  clearAuthData as clearAuth,
  api
};