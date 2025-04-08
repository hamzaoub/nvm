export interface Menu {
  id: number;
  name: string;
  machine_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: number;
  menu_id: number;
  name: string;
  uri: string | null;
  description: string | null;
  icon: string | null;
  icon_name: string | null;
  icon_library: string | null;
  color: string | null;
  roles: string | null;
  weight: number;
  enabled: boolean;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface MenuResponse {
  menu: Menu;
  items: MenuItem[];
}

// Icons mapping for dynamic component rendering
export interface IconMapItem {
  [key: string]: React.ComponentType<React.SVGAttributes<SVGElement>>;
}
