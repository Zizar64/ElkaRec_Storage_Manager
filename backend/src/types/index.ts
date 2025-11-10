import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
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

export interface EquipmentFilters {
  sector?: string;
  status?: string;
  search?: string;
}
