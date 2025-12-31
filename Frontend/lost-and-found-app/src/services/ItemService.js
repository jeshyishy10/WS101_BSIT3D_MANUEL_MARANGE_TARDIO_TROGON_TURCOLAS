// Item Service - Re-export from api module
import { itemAPI } from './api';

const ItemService = {
  // Public methods
  getAllItems: itemAPI.getAllItems,
  getItemById: itemAPI.getItemById,
  createItem: itemAPI.createItem,
  updateItem: itemAPI.updateItem,
  deleteItem: itemAPI.deleteItem,
  getUserItems: itemAPI.getUserItems,
  searchItems: itemAPI.searchItems,
  getCategories: itemAPI.getCategories,

  // Admin methods
  adminGetAllItems: itemAPI.adminGetAllItems,
  adminCreateItem: itemAPI.adminCreateItem,
  adminDeleteItem: itemAPI.adminDeleteItem
};

export default ItemService;