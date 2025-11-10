export enum Sector {
  BROADCAST = 'BROADCAST',
  EVENEMENTIEL = 'EVENEMENTIEL',
  INFORMATIQUE = 'INFORMATIQUE',
}

export enum MaintenanceStatus {
  READY = 'READY',
  A_REVISER = 'A_REVISER',
  EN_MAINTENANCE = 'EN_MAINTENANCE',
  HS = 'HS',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  createdAt: string;
}

export interface Equipment {
  id: string;
  tag: string;
  localisation: string;
  sector: Sector;
  type: string;
  manufacturer: string;
  model: string;
  status: MaintenanceStatus;
  serialNumber?: string;
  purchaseDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentHistory {
  id: string;
  equipmentId: string;
  userId: string;
  user: Pick<User, 'email' | 'firstName' | 'lastName'>;
  oldStatus: MaintenanceStatus;
  newStatus: MaintenanceStatus;
  description: string;
  changedAt: string;
}

export interface EquipmentWithHistory extends Equipment {
  history: EquipmentHistory[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface EquipmentFilters {
  sector?: string;
  status?: string;
  search?: string;
}
