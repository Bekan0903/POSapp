
export enum UserRole {
  ADMIN = 'ADMIN',
  PHARMACIST = 'PHARMACIST'
}

export enum UnitType {
  TABLET = 'Tablet',
  BOX = 'Box',
  BOTTLE = 'Bottle',
  STRIP = 'Strip'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  fullName: string;
  password?: string;
}

export interface Medicine {
  id: string;
  name: string;
  strength: string;
  unitType: UnitType;
  stock: number;
  minThreshold: number;
  price: number;
}

export interface Sale {
  id: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  totalPrice: number;
  timestamp: string;
  userId: string;
}

export interface Purchase {
  id: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  supplier: string;
  timestamp: string;
  userId: string;
}

export interface Notification {
  id: string;
  type: 'ALERT' | 'REPORT' | 'SYSTEM';
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  medicines: Medicine[];
  sales: Sale[];
  purchases: Purchase[];
  notifications: Notification[];
}
