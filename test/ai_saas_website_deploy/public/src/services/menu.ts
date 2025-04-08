import axios from '@/lib/axios';

// Define types locally until path resolution is fixed
export interface Menu {
  id: number;
  name: string;
  machine_name: string;
  description: string | null;
}

export interface MenuItem {
  id: number;
  menu_id: number;
  name: string;
  uri: string | null;
  icon_name: string | null;
  icon_library: string | null;
  color: string | null;
  roles: string | null;
}

export interface MenuResponse {
  menu: Menu;
  items: MenuItem[];
}

// The menu service handles API calls related to menu items
const menuService = {
  /**
   * Get menu items for a specific menu machine name
   * @param menuName Machine name of the menu
   * @returns Promise with menu items
   */
  async getMenuItems(menuName: string = 'sidebar_menu'): Promise<MenuResponse> {
    try {
      const response = await axios.get(`/menu/${menuName}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  },
};

export default menuService;
