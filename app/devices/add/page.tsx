"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DeviceForm } from "@/components/devices/device-form";
import { DeviceFormData, User } from "@/types";
import { getCurrentUser } from "@/lib/auth";
import { addDevice } from "@/lib/devices";

export default function AddDevicePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (!currentUser) {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = (data: DeviceFormData) => {
    if (user) {
      addDevice(data, user.email);
      router.push("/devices");
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Device</h1>
          <p className="text-muted-foreground mt-2">
            Enter the details of the new network device.
          </p>
        </div>
        
        <div className="max-w-3xl">
          <DeviceForm onSubmit={handleSubmit} />
        </div>
      </div>
    </DashboardLayout>
  );
}