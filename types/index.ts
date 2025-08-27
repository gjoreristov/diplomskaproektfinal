export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}

export interface Device {
  id: string;
  name: string;
  ipAddress: string;
  macAddress: string;
  room: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface DeviceFormData {
  name: string;
  ipAddress: string;
  macAddress: string;
  room: string;
  description: string;
  aiDescription?: string;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
  suggestions?: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DeviceState {
  devices: Device[];
  filteredDevices: Device[];
  isLoading: boolean;
  searchTerm: string;
}