import { Device, DeviceFormData } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Mock device data for demo purposes
// In a real application, this would be stored in a database
let devices: Device[] = [
  {
    id: "1",
    name: "SERVER001",
    ipAddress: "192.168.1.1",
    macAddress: "00:1A:2B:3C:4D:5E",
    room: "Server Room A",
    description: "Main database server",
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 2, 10).toISOString(),
    createdBy: "admin@example.com",
  },
  {
    id: "2",
    name: "PC-HR001",
    ipAddress: "192.168.1.101",
    macAddress: "11:22:33:44:55:66",
    room: "Office 101",
    description: "HR department workstation",
    createdAt: new Date(2023, 1, 5).toISOString(),
    updatedAt: new Date(2023, 1, 5).toISOString(),
    createdBy: "admin@example.com",
  },
  {
    id: "3",
    name: "PRINTER-MAIN",
    ipAddress: "192.168.1.201",
    macAddress: "AA:BB:CC:DD:EE:FF",
    room: "Office 102",
    description: "Main office networked printer",
    createdAt: new Date(2023, 2, 20).toISOString(),
    updatedAt: new Date(2023, 2, 20).toISOString(),
    createdBy: "admin@example.com",
  },
];

export const getAllDevices = (): Device[] => {
  return [...devices];
};

export const getDeviceById = (id: string): Device | undefined => {
  return devices.find((device) => device.id === id);
};

export const addDevice = (deviceData: DeviceFormData, userEmail: string): Device => {
  const newDevice: Device = {
    id: uuidv4(),
    ...deviceData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: userEmail,
  };
  
  devices.push(newDevice);
  return newDevice;
};

export const updateDevice = (id: string, deviceData: DeviceFormData): Device | null => {
  const index = devices.findIndex((device) => device.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedDevice: Device = {
    ...devices[index],
    ...deviceData,
    updatedAt: new Date().toISOString(),
  };
  
  devices[index] = updatedDevice;
  return updatedDevice;
};

export const deleteDevice = (id: string): boolean => {
  const initialLength = devices.length;
  devices = devices.filter((device) => device.id !== id);
  return devices.length < initialLength;
};

export const searchDevices = (query: string): Device[] => {
  const searchTerm = query.toLowerCase();
  
  return devices.filter((device) => 
    device.name.toLowerCase().includes(searchTerm) ||
    device.ipAddress.toLowerCase().includes(searchTerm) ||
    device.macAddress.toLowerCase().includes(searchTerm) ||
    device.room.toLowerCase().includes(searchTerm) ||
    device.description.toLowerCase().includes(searchTerm)
  );
};