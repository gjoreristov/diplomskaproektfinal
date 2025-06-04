"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DeviceTable } from "@/components/devices/device-table";
import { Device, DeviceFormData, User } from "@/types";
import { getCurrentUser } from "@/lib/auth";
import { getAllDevices, updateDevice, deleteDevice } from "@/lib/devices";

export default function DevicesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Get all devices
    const allDevices = getAllDevices();
    setDevices(allDevices);
    setIsLoading(false);
  }, []);

  const handleDelete = (id: string) => {
    deleteDevice(id);
    setDevices(getAllDevices());
  };

  const handleUpdate = (id: string, data: DeviceFormData) => {
    updateDevice(id, data);
    setDevices(getAllDevices());
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[400px]">
          <p>Loading devices...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
          <p className="text-muted-foreground mt-2">
            Manage your network devices. Add, edit, or remove devices from your network.
          </p>
        </div>
        
        <DeviceTable 
          devices={devices} 
          currentUser={user}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      </div>
    </DashboardLayout>
  );
}